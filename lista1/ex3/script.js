document.getElementById('imageForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const quantity = document.getElementById('quantity').value;

    if (validateInputs(width, height, quantity)) {
        fetchImages(width, height, quantity);
    }
});

function validateInputs(width, height, quantity) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';

    if (width < 100 || width > 1920 || height < 100 || height > 1080) {
        errorDiv.textContent = 'Largura e altura devem estar entre 100 e 1920px/1080px.';
        return false;
    }
    if (!['1', '3', '5', '10', '20'].includes(quantity)) {
        errorDiv.textContent = 'Quantidade de imagens inválida.';
        return false;
    }
    return true;
}

async function fetchImages(width, height, quantity) {
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = '';

    const ids = new Set();

    // Gerar IDs únicos para evitar imagens repetidas
    while (ids.size < quantity) {
        const id = Math.floor(Math.random() * 1000);
        ids.add(id);
    }

    ids.forEach(id => {
        const imgURL = `https://picsum.photos/id/${id}/${width}/${height}.webp`;
        const imageElement = createImageElement(imgURL, width, height);
        imageGrid.appendChild(imageElement);
    });
}

function createImageElement(url, width, height) {
    const container = document.createElement('div');

    const img = document.createElement('img');
    img.src = url;
    img.alt = `Imagem aleatória ${width}x${height}`;
    img.setAttribute('aria-describedby', 'Baixar ou compartilhar a imagem');

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `imagem_${width}x${height}.webp`;
    downloadLink.textContent = 'Baixar em Full HD';

    const copyLinkButton = document.createElement('button');
    copyLinkButton.textContent = 'Copiar Link';
    copyLinkButton.onclick = () => copyToClipboard(url);

    const shareButton = document.createElement('button');
    shareButton.textContent = 'Compartilhar';
    shareButton.onclick = () => shareImage(url);

    container.appendChild(img);
    container.appendChild(downloadLink);
    container.appendChild(copyLinkButton);
    container.appendChild(shareButton);

    return container;
}

function copyToClipboard(url) {
    navigator.clipboard.writeText(url)
        .then(() => alert('Link copiado para a área de transferência!'))
        .catch(err => alert('Erro ao copiar o link: ' + err));
}

function shareImage(url) {
    const message = `Confira esta imagem: ${url}`;
    if (navigator.share) {
        navigator.share({
            title: 'Imagem Aleatória',
            text: message,
            url: url,
        }).catch(err => alert('Erro ao compartilhar: ' + err));
    } else {
        window.open(`mailto:?subject=Imagem Aleatória&body=${message}`, '_blank');
    }
}
