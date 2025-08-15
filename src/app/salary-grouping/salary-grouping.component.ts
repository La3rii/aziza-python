import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as FileSaver from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-salary-grouping',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salary-grouping.component.html',
  styleUrls: ['./salary-grouping.component.css']
})
export class SalaryGroupingComponent {
  selectedFile: File | null = null;
  isProcessing = false;
  processingMessage = '';
  fileName = '';
  currentYear = new Date().getFullYear();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    }
  }

  async processFile() {
    if (!this.selectedFile) {
      alert('Please select a file first');
      return;
    }

    this.isProcessing = true;
    this.processingMessage = 'Processing file...';

    try {
      // Read the CSV file
      const fileContent = await this.readFile(this.selectedFile);
      const csvToJson = (await import('csvtojson')).default;
      const jsonArray = await csvToJson().fromString(fileContent);

      // Process the data
      const processedData = this.processData(jsonArray);

      // Generate output files
      await this.generateOutputFiles(processedData);

      this.processingMessage = 'Files generated successfully!';
    } catch (error) {
      console.error('Error processing file:', error);
      this.processingMessage = 'Error processing file';
    } finally {
      this.isProcessing = false;
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  private processData(data: any[]) {
    // Add salary column and convert to number
    const withSalary = data.map(row => ({
      ...row,
      Salaire: Number(row['Nombre de jours']) * 3
    }));

    // Filter and sort
    const filtered = withSalary.filter(row => row.Salaire >= 0 && row.Salaire <= 27);
    const sorted = filtered.sort((a, b) => a.Salaire - b.Salaire);

    return sorted;
  }

  private async generateOutputFiles(data: any[]) {
    if (data.length === 0) {
      throw new Error('No valid data to process');
    }

    // Generate first CSV file
    const csv1Content = this.convertToCsv(data);
    this.downloadFile(csv1Content, 'personnes_100_salaire.csv');

    // Generate grouped CSV file
    const groupedCsvContent = this.generateGroupedCsv(data);
    this.downloadFile(groupedCsvContent, 'regroupement_par_salaire.csv');

    // Generate PDF document
    this.generatePdfDocument(data);
  }

  private convertToCsv(data: any[]): string {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  private generateGroupedCsv(data: any[]): string {
    let outputRows = [];
    let groupNumber = 1;

    // Group by salary
    const groups = this.groupBy(data, 'Salaire');

    for (const [salaire, group] of Object.entries(groups)) {
      const nombre_personnes = group.length;
      const nombre_jours = group[0]['Nombre de jours'];
      
      outputRows.push([`GROUPE ${groupNumber} - Salaire: ${salaire}DT`]);
      outputRows.push([`Nombre de personnes: ${nombre_personnes}`]);
      outputRows.push([`Nombre de jours: ${nombre_jours}`]);
      outputRows.push([]);
      
      outputRows.push([
        '"Nom"', '"Prénom"',
        '"ID Groupe"',
        '"Salaire (DT)"',
        '"Jours travaillés"'
      ]);
      
      for (const row of group) {
        outputRows.push([
          `"${row["Nom"]}"`, 
          `"${row["Prénom"]}"`, 
          `"G${groupNumber}"`, 
          `"${salaire}"`, 
          `"${nombre_jours}"`
        ]);
      }
      
      outputRows.push([]);
      outputRows.push([`"${'='.repeat(50)}"`]);
      outputRows.push([]);
      
      groupNumber++;
    }

    return outputRows.map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
  }

  private groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((result, currentValue) => {
      const groupKey = currentValue[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentValue);
      return result;
    }, {} as Record<string, any[]>);
  }

  private generatePdfDocument(data: any[]) {
    const doc = new jsPDF();
    const groups = this.groupBy(data, 'Salaire');
    let groupNumber = 1;
    let yPosition = 20;

    // Add title
    doc.setFontSize(18);
    doc.text('Salary Grouping Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);

    for (const [salaire, group] of Object.entries(groups)) {
      const nombre_personnes = group.length;
      const nombre_jours = group[0]['Nombre de jours'];

      // Add group header
      doc.text(`GROUPE ${groupNumber} - Salaire: ${salaire}DT`, 14, yPosition);
      yPosition += 7;
      doc.text(`Nombre de personnes: ${nombre_personnes}`, 14, yPosition);
      doc.text(`Jours travaillés: ${nombre_jours}`, 105, yPosition);
      yPosition += 10;

      // Prepare table data
      const tableData = group.map(row => [
        row["Nom"],
        row["Prénom"],
        `G${groupNumber}`,
        salaire,
        nombre_jours
      ]);

      // Add table
      (doc as any).autoTable({
        startY: yPosition,
        head: [['Nom', 'Prénom', 'ID Groupe', 'Salaire (DT)', 'Jours']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
      groupNumber++;
    }

    // Add footer
    doc.text(`Total des groupes: ${groupNumber-1}`, 190, 285, { align: 'right' });

    // Save the PDF
    doc.save('regroupement_par_salaire.pdf');
  }

  private downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, filename);
  }
}