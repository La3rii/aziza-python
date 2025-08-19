import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import csvtojson from 'csvtojson';

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
  showConfirmationModal = false;
  showErrorModal = false;
  errorMessage = '';
  showDownloadButton = false;

  private csv1Content: string = '';
  private groupedCsvContent: string = '';
  private groupedExcelData: any[] = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.name.toLowerCase() !== 'personnes_100.csv') {
        this.errorMessage = "❌ Veuillez télécharger un fichier nommé « personnes_100.csv » uniquement.";
        this.showErrorModal = true;
        this.selectedFile = null;
        this.fileName = '';
        input.value = '';
      } else {
        this.selectedFile = file;
        this.fileName = file.name;
        this.showConfirmationModal = true;
      }
    }
  }

  confirmDownload() {
    this.showConfirmationModal = false;
    this.processFile();
    this.showDownloadButton = true;
  }

  cancelDownload() {
    this.showConfirmationModal = false;
    this.fileName = '';
    this.selectedFile = null;
    this.showDownloadButton = false;
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  async processFile() {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.processingMessage = 'Traitement du fichier...';

    try {
      const fileContent = await this.readFile(this.selectedFile);
      const jsonArray = await csvtojson().fromString(fileContent);

      const processedData = this.processData(jsonArray);

      this.csv1Content = this.convertToCsv(processedData);
      this.groupedCsvContent = this.generateGroupedCsv(processedData);
      this.groupedExcelData = this.generateGroupedExcel(processedData);

      this.processingMessage = 'Fichiers prêts à être téléchargés ✅';
    } catch (error) {
      console.error('Erreur lors du traitement du fichier :', error);
      this.processingMessage = 'Erreur lors du traitement du fichier';
    } finally {
      this.isProcessing = false;
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) resolve(event.target.result as string);
        else reject(new Error('Échec de la lecture du fichier'));
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  private processData(data: any[]) {
    const withSalary = data.map(row => ({
      ...row,
      Salaire: Number(row['Nombre de jours']) * 3,
      Immatriculation: row['Immatriculation'] || ''
    }));
    return withSalary.filter(row => row.Salaire >= 0 && row.Salaire <= 27)
                     .sort((a, b) => a.Salaire - b.Salaire);
  }

  private convertToCsv(data: any[]): string {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${row[h]}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  private generateGroupedCsv(data: any[]): string {
    const outputRows: string[][] = [];
    let groupNumber = 1;
    const groups = this.groupBy(data, 'Salaire');

    for (const [salaire, group] of Object.entries(groups)) {
      const nombre_personnes = group.length;
      const nombre_jours = group[0]['Nombre de jours'];

      outputRows.push([`GROUPE ${groupNumber} - Salaire: ${salaire}DT`]);
      outputRows.push([`Nombre de personnes: ${nombre_personnes}`]);
      outputRows.push([`Nombre de jours: ${nombre_jours}`]);
      outputRows.push([]);
      outputRows.push(['Nom', 'Prénom', 'Immatriculation', 'ID Groupe', 'Salaire (DT)', 'Jours']);

      for (const row of group) {
        outputRows.push([
          row.Nom,
          row.Prénom,
          row.Immatriculation,
          `G${groupNumber}`,
          salaire,
          nombre_jours
        ]);
      }

      outputRows.push([]);
      outputRows.push(['='.repeat(60)]);
      outputRows.push([]);
      groupNumber++;
    }

    return outputRows.map(r => r.join(',')).join('\n');
  }

  private generateGroupedExcel(data: any[]): any[] {
    const excelData: any[] = [];
    let groupNumber = 1;
    const groups = this.groupBy(data, 'Salaire');

    for (const [salaire, group] of Object.entries(groups)) {
      const nombre_personnes = group.length;
      const nombre_jours = group[0]['Nombre de jours'];

      excelData.push({ info: `GROUPE ${groupNumber} - Salaire: ${salaire}DT` });
      excelData.push({ info: `Nombre de personnes: ${nombre_personnes}` });
      excelData.push({ info: `Nombre de jours: ${nombre_jours}` });
      excelData.push({ Nom: 'Nom', Prénom: 'Prénom', Immatriculation: 'Immatriculation', IDGroupe: 'ID Groupe', Salaire: 'Salaire (DT)', Jours: 'Jours' });

      for (const row of group) {
        excelData.push({
          Nom: row.Nom,
          Prénom: row.Prénom,
          Immatriculation: row.Immatriculation,
          IDGroupe: `G${groupNumber}`,
          Salaire: salaire,
          Jours: nombre_jours
        });
      }

      excelData.push({});
      groupNumber++;
    }

    return excelData;
  }

  private groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((result, current) => {
      const k = current[key];
      if (!result[k]) result[k] = [];
      result[k].push(current);
      return result;
    }, {} as Record<string, any[]>);
  }

  downloadFiles() {
    if (this.csv1Content) {
      const blob1 = new Blob([this.csv1Content], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob1, 'personnes_100_salaire.csv');
    }

    if (this.groupedCsvContent) {
      const blob2 = new Blob([this.groupedCsvContent], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob2, 'regroupement_par_salaire.csv');
    }

    if (this.groupedExcelData.length > 0) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.groupedExcelData, { skipHeader: true });
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Regroupement');
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'regroupement_par_salaire.xlsx');
    }
  }
}
