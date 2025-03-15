export function handleFileDrop(event: DragEvent) {
    event.preventDefault();

    if (!event.dataTransfer?.files.length) return;

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile.type.startsWith('image/')) {
        return droppedFile;
    }
}

export function handleFileSelect(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files?.length) return;

    return inputElement.files[0];
}

export function handleImageSelect(imageFile: File, targetImageElement: HTMLImageElement) {
    const fileReader = new FileReader();

    fileReader.onload = (loadEvent) => {
        if (typeof loadEvent.target?.result !== 'string') return;
        targetImageElement.src = loadEvent.target.result;
    };

    fileReader.readAsDataURL(imageFile);
}