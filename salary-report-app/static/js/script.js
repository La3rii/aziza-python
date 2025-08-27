document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const fileName = document.getElementById('fileName');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const confirmationModal = document.getElementById('confirmationModal');
  const downloadConfirmationModal = document.getElementById('downloadConfirmationModal');
  const errorModal = document.getElementById('errorModal');
  const errorMessage = document.getElementById('errorMessage');
  const downloadContainer = document.getElementById('downloadContainer');
  const downloadButton = document.getElementById('downloadButton');
  const confirmProcess = document.getElementById('confirmProcess');
  const cancelProcess = document.getElementById('cancelProcess');
  const confirmDownload = document.getElementById('confirmDownload');
  const cancelDownload = document.getElementById('cancelDownload');
  const closeError = document.getElementById('closeError');
  
  let sessionId = null;
  
  // File selection handler
  fileInput.addEventListener('change', function(e) {
    if (this.files && this.files.length > 0) {
      const file = this.files[0];
      
      if (file.name.toLowerCase() !== 'personnes_100.csv') {
        showError("❌ Veuillez télécharger un fichier nommé « personnes_100.csv » uniquement.");
        fileName.innerHTML = '<strong>Aucun fichier sélectionné</strong>';
        this.value = '';
      } else {
        fileName.innerHTML = `<strong>${file.name}</strong>`;
        confirmationModal.style.display = 'flex';
      }
    }
  });
  
  // Confirm file processing
  confirmProcess.addEventListener('click', function() {
    confirmationModal.style.display = 'none';
    processFile(fileInput.files[0]);
  });
  
  cancelProcess.addEventListener('click', function() {
    confirmationModal.style.display = 'none';
    fileName.innerHTML = '<strong>Aucun fichier sélectionné</strong>';
    fileInput.value = '';
  });
  
  // Download button click -> show modal
  downloadButton.addEventListener('click', function() {
    if (!sessionId) {
      showError("Erreur : aucun fichier à télécharger.");
      return;
    }
    downloadConfirmationModal.style.display = 'flex';
  });
  
  // Confirm download
  confirmDownload.addEventListener('click', function() {
    downloadConfirmationModal.style.display = 'none';
    window.location.href = `/download/${sessionId}`;
  });
  
  cancelDownload.addEventListener('click', function() {
    downloadConfirmationModal.style.display = 'none';
  });

  // Error modal
  closeError.addEventListener('click', function() {
    errorModal.style.display = 'none';
  });
  
  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
  }
  
  // Process uploaded file
  async function processFile(file) {
    loadingOverlay.style.display = 'flex';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        sessionId = result.session_id;
        downloadContainer.style.display = 'block';
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Erreur de connexion au serveur');
      console.error('Error:', error);
    } finally {
      loadingOverlay.style.display = 'none';
    }
  }
});
