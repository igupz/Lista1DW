// Elementos DOM
const captureBtn = document.getElementById('capture-photo');
const uploadInput = document.getElementById('upload-photo');
const camera = document.getElementById('camera');
const photoPreview = document.getElementById('photo-preview');
const markLocationBtn = document.getElementById('mark-location');
const mapDiv = document.getElementById('map');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const saveDataBtn = document.getElementById('save-data');
const photoTable = document.getElementById('photo-table').querySelector('tbody');

let capturedImage = null;
let currentLocation = null;
let map = null;

// Inicializar mapa
function initMap(containerId) {
    return L.map(containerId).setView([0, 0], 2);
}

function updateMap(lat, lng) {
    if (map) map.remove();
    map = initMap('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    if (lat && lng) {
        L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 13);
    }
}

// Capturar foto com a câmera ou permitir upload
captureBtn.onclick = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            camera.srcObject = stream;
            camera.classList.remove('d-none');
            photoPreview.classList.add('d-none');
        })
        .catch(() => {
            uploadInput.click();
        });
};

uploadInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            capturedImage = e.target.result;
            photoPreview.src = capturedImage;
            photoPreview.classList.remove('d-none');
            camera.classList.add('d-none');
        };
        reader.readAsDataURL(file);
    }
};

camera.onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
    capturedImage = canvas.toDataURL('image/png');
    camera.srcObject.getTracks().forEach(track => track.stop());
    camera.classList.add('d-none');
    photoPreview.src = capturedImage;
    photoPreview.classList.remove('d-none');
};

// Obter localização
markLocationBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        updateMap(currentLocation.lat, currentLocation.lng);
    }, () => {
        alert('Localização não encontrada. Marque manualmente no mapa.');
        updateMap();
    });
};

// Salvar dados
saveDataBtn.onclick = () => {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        alert('O título é obrigatório!');
        return;
    }

    const id = new Date().getTime();
    const date = new Date().toLocaleString();

    const data = {
        id,
        title,
        description,
        image: capturedImage,
        location: currentLocation,
        date
    };

    saveToLocalStorage(data);
    addToTable(data);
    resetForm();
};

// Armazenar dados no LocalStorage
function saveToLocalStorage(data) {
    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    photos.push(data);
    localStorage.setItem('photos', JSON.stringify(photos));
}

// Carregar dados ao iniciar
function loadFromLocalStorage() {
    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    photos.forEach(photo => addToTable(photo));
}

// Adicionar registros à tabela
function addToTable(data) {
    const row = photoTable.insertRow();
    row.dataset.id = data.id;

    row.innerHTML = `
        <td>${data.id}</td>
        <td>${data.title}</td>
        <td>${data.description}</td>
        <td>${data.location ? `${data.location.lat}, ${data.location.lng}` : 'N/A'}</td>
        <td>${data.date}</td>
        <td>
            <button class="btn btn-info btn-sm view-btn">Visualizar</button>
            <button class="btn btn-warning btn-sm edit-btn">Editar</button>
            <button class="btn btn-danger btn-sm delete-btn">Excluir</button>
        </td>
    `;

    row.querySelector('.view-btn').onclick = () => viewDetails(data);
    row.querySelector('.edit-btn').onclick = () => editDetails(data);
    row.querySelector('.delete-btn').onclick = () => confirmDelete(data.id);
}

// Exibir detalhes em modal
function viewDetails(data) {
    $('#modal-photo').attr('src', data.image);
    $('#modal-title').text(data.title);
    $('#modal-description').text(data.description);
    const modalMap = initMap('modal-map');
    if (data.location) {
        L.marker([data.location.lat, data.location.lng]).addTo(modalMap);
        modalMap.setView([data.location.lat, data.location.lng], 13);
    }
    $('#viewModal').modal('show');
}

// Editar detalhes
let editingData = null; // Variável para armazenar o registro sendo editado

// Função para iniciar o mapa de edição
function initEditMap(containerId, lat, lng) {
    const editMap = L.map(containerId).setView([lat || 0, lng || 0], lat && lng ? 13 : 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(editMap);

    if (lat && lng) {
        L.marker([lat, lng]).addTo(editMap);
    }

    return editMap;
}

// Função para exibir o formulário de edição com os dados preenchidos
function editDetails(data) {
    editingData = data;

    // Preenche os campos do formulário de edição
    document.getElementById('edit-title').value = data.title;
    document.getElementById('edit-description').value = data.description || '';

    // Inicia o mapa de edição com a localização atual
    const editMap = initEditMap('edit-map', data.location?.lat, data.location?.lng);

    // Exibe a modal de edição
    $('#editModal').modal('show');

    // Atualiza a localização ao clicar no mapa de edição
    editMap.on('click', function (e) {
        const { lat, lng } = e.latlng;
        if (data.location) {
            data.location.lat = lat;
            data.location.lng = lng;
        } else {
            data.location = { lat, lng };
        }

        // Remove marcadores antigos e adiciona um novo
        editMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                editMap.removeLayer(layer);
            }
        });

        L.marker([lat, lng]).addTo(editMap);
    });
}

// Função para salvar as alterações feitas no registro
document.getElementById('save-edit').onclick = () => {
    if (!editingData) return;

    const updatedTitle = document.getElementById('edit-title').value.trim();
    const updatedDescription = document.getElementById('edit-description').value.trim();

    if (!updatedTitle) {
        alert('O título é obrigatório!');
        return;
    }

    // Atualiza os valores do registro editado
    editingData.title = updatedTitle;
    editingData.description = updatedDescription;

    // Atualiza o LocalStorage
    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    const index = photos.findIndex(photo => photo.id === editingData.id);
    if (index !== -1) {
        photos[index] = editingData;
        localStorage.setItem('photos', JSON.stringify(photos));
    }

    // Atualiza a tabela com os novos dados
    updateTableRow(editingData);

    // Fecha o modal de edição
    $('#editModal').modal('hide');
};

// Atualiza a linha da tabela com os dados editados
function updateTableRow(data) {
    const row = document.querySelector(`tr[data-id="${data.id}"]`);
    if (row) {
        row.cells[1].textContent = data.title;
        row.cells[2].textContent = data.description;
        row.cells[3].textContent = data.location ? `${data.location.lat}, ${data.location.lng}` : 'N/A';
    }
}


// Confirmar exclusão
function confirmDelete(id) {
    $('#deleteModal').modal('show');
    document.getElementById('confirm-delete').onclick = () => {
        deleteFromLocalStorage(id);
        $(`tr[data-id="${id}"]`).remove();
        $('#deleteModal').modal('hide');
    };
}

// Excluir do LocalStorage
function deleteFromLocalStorage(id) {
    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    localStorage.setItem('photos', JSON.stringify(updatedPhotos));
}

// Resetar o formulário
function resetForm() {
    titleInput.value = '';
    descriptionInput.value = '';
    photoPreview.src = '';
    currentLocation = null;
    updateMap();
}

window.onload = () => {
    loadFromLocalStorage();
    map = initMap('map');
};
