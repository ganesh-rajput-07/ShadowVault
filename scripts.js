
// Base64 Encoding and Decoding
function base64Encode(text) {
    return btoa(text);
}

function base64Decode(text) {
    return atob(text);
}

// ROT13 Encoding and Decoding
function rot13Encode(text) {
    return text.replace(/[a-zA-Z]/g, function (char) {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(start + (char.charCodeAt(0) - start + 13) % 26);
    });
}

function rot13Decode(text) {
    return rot13Encode(text);
}

// Caesar Cipher Encoding and Decoding
function caesarEncode(text, shift) {
    return text.replace(/[a-zA-Z]/g, function (char) {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(start + (char.charCodeAt(0) - start + shift) % 26);
    });
}

function caesarDecode(text, shift) {
    return caesarEncode(text, 26 - shift);
}

// General encode function
function encode() {
    const algorithm = document.getElementById("algorithm-select").value;
    const inputText = document.getElementById("inputText").value;
    let encodedText = '';

    switch (algorithm) {
        case 'base64':
            encodedText = base64Encode(inputText);
            break;
        case 'rot13':
            encodedText = rot13Encode(inputText);
            break;
        case 'caesar':
            const shift = 3;
            encodedText = caesarEncode(inputText, shift);
            break;
        default:
            encodedText = 'Invalid algorithm';
    }

    document.getElementById("outputText").value = encodedText;
}

function decode() {
    let algorithm = document.getElementById("algorithm-select").value;
    let inputText = document.getElementById("inputText").value;
    let outputText = "";

    switch (algorithm) {
        case "base64":
            try {
                outputText = atob(inputText);
            } catch (e) {
                outputText = "Invalid Base64 input!";
            }
            break;

        case "rot13":
            outputText = rot13Encode(inputText);
            break;

        case "caesar":
            const shift = 3;
            outputText = caesarDecode(inputText, shift);
            break;

        default:
            outputText = "Unknown decoding algorithm.";
    }

    document.getElementById("outputText").value = outputText;
}

function encodeImageToBase64() {
    const fileInput = document.getElementsByClassName("imageInput")[0];
    const outputText = document.getElementById("outputText");

    if (!fileInput.files[0]) {
        alert("Please select an image file first.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        outputText.value = e.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
}

function decodeBase64ToFile() {
    const base64Input = document.getElementsByClassName("base64Input")[0].value.trim();
    const imageOutput = document.getElementById("imageOutput");

    if (!base64Input) {
        alert("Please paste a Base64 string.");
        return;
    }

    const matches = base64Input.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
        alert("Only valid Base64-encoded images are supported!");
        return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const fileExtension = mimeType.split("/")[1] || "png";

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const objectURL = URL.createObjectURL(blob);

    const img = document.createElement("img");
    img.src = objectURL;
    img.style.maxWidth = "300px";
    img.style.marginTop = "10px";

    const downloadBtn = document.createElement("a");
    downloadBtn.href = objectURL;
    downloadBtn.download = `decoded_image.${fileExtension}`;
    downloadBtn.innerHTML = "Downloading...";
    downloadBtn.className = "download-btn";
    downloadBtn.style.display = "inline-block";
    downloadBtn.style.marginTop = "10px";
    downloadBtn.style.padding = "8px 12px";
    downloadBtn.style.backgroundColor = "#00ffe1";
    downloadBtn.style.color = "#000";
    downloadBtn.style.borderRadius = "5px";
    downloadBtn.style.textDecoration = "none";
    downloadBtn.style.fontWeight = "bold";
    downloadBtn.style.transition = "all 0.3s ease-in-out";

    // Animate the button on click
    downloadBtn.addEventListener("click", function () {
        downloadBtn.innerHTML = "Preparing...";
        downloadBtn.style.backgroundColor = "#fff700";
        setTimeout(() => {
            downloadBtn.innerHTML = "Download Ready";
            downloadBtn.style.backgroundColor = "#00ffe1";
        }, 1500);
    });

    imageOutput.innerHTML = "";
    imageOutput.appendChild(img);
    imageOutput.appendChild(downloadBtn);
}

function downloadEncodedText() {
    const base64Text = document.getElementById("outputText").value;
    const selectedFormat = document.getElementById("fileFormat").value;

    if (!base64Text) {
        alert("No encoded text found to download!");
        return;
    }

    const filename = "encoded_image";

    if (selectedFormat === "txt") {
        const blob = new Blob([base64Text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename + ".txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    else if (selectedFormat === "pdf") {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const lines = pdf.splitTextToSize(base64Text, 180);
        pdf.text(lines, 10, 10);
        pdf.save(filename + ".pdf");
    }

    else if (selectedFormat === "docx") {
        const doc = new docx.Document({
            sections: [
                {
                    children: [
                        new docx.Paragraph(base64Text)
                    ],
                },
            ],
        });

        docx.Packer.toBlob(doc).then((blobData) => {
            saveAs(blobData, filename + ".docx");
        });
    }
}

// Copy to Clipboard
function copyToClipboard() {
    const textArea = document.getElementById("outputText");
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(textArea.value)
        .then(() => {
            alert("Text copied to clipboard!");
        })
        .catch(err => {
            console.error("Failed to copy text: ", err);
            alert("Failed to copy text to clipboard.");
        });
}

// Drag & Drop File Preview
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragging');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragging');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragging');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
});

function handleFiles(files) {
    fileList.innerHTML = '';
    for (const file of files) {
        const icon = getFileIcon(file.name);
        const fileItem = document.createElement('p');
        fileItem.innerHTML = `${icon} ${file.name}`;
        fileList.appendChild(fileItem);
    }
}

function getFileIcon(filename) {
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.endsWith('.txt')) return '🗒️';
    if (filename.endsWith('.zip')) return '🗃️';
    if (filename.endsWith('.docx')) return '📘';
    return '📁';
}
