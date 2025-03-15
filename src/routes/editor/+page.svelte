<script lang="ts">
    import { onMount } from 'svelte';
    import Navbar from '../../components/Navbar.svelte';
    import Footer from '../../components/Footer.svelte';
    import type { ImageFilters } from '$lib/image/types';
    import { defaultFilters } from '$lib/image/types';
    import { handleFileDrop, handleFileSelect, handleImageSelect } from '$lib/image/fileHandlers';
    import { updateImage } from '$lib/image/imageProcessing';
    import { debounce } from 'lodash-es';

    let imageFile: File | null = null;
    let editedCanvas: HTMLCanvasElement;
    let editedCtx: CanvasRenderingContext2D | null = null;
    let imageElement: HTMLImageElement;
    let imageLoaded = false;
    let isProcessing = false;

    let filters: ImageFilters = { ...defaultFilters };

    const debouncedUpdateImage = debounce((canvas, ctx, img, filts, loaded) => {
        if (loaded && !isProcessing) {
            isProcessing = true;
            requestAnimationFrame(() => {
                updateImage(canvas, ctx, img, filts, loaded);
                isProcessing = false;
            });
        }
    }, 100);

    onMount(() => {
        imageElement = new Image();
        imageElement.onload = () => {
            if (!editedCanvas) return;

            editedCanvas.width = imageElement.naturalWidth;
            editedCanvas.height = imageElement.naturalHeight;
            editedCtx = editedCanvas.getContext('2d');

            if (!editedCtx) return;

            editedCtx.drawImage(imageElement, 0, 0);
            imageLoaded = true;
            debouncedUpdateImage(editedCanvas, editedCtx, imageElement, filters, imageLoaded);
        };
    });
    
    function resetFilters() {
        filters = { ...defaultFilters };
    }

    $: {
        if (imageLoaded) {
            debouncedUpdateImage(editedCanvas, editedCtx!, imageElement, filters, imageLoaded);
        }
    }

    // $: filters.brightness, updateImage(editedCanvas, editedCtx!, imageElement, filters, imageLoaded);
    // $: filters.contrast, updateImage(editedCanvas, editedCtx!, imageElement, filters, imageLoaded);
    // $: filters.saturation, updateImage(editedCanvas, editedCtx!, imageElement, filters, imageLoaded);
    // $: filters.temperature, updateImage(editedCanvas, editedCtx!, imageElement, filters, imageLoaded);
    // $: filters.sharpness, updateImage(editedCanvas, editedCtx!, imageElement, filters, imageLoaded);

    function handleDrop(e: DragEvent) {
        const file = handleFileDrop(e);
        if (file) {
            imageFile = file;
            handleImageSelect(file, imageElement);
        }
    }

    function handleChange(e: Event) {
        const file = handleFileSelect(e);
        if (file) {
            imageFile = file;
            handleImageSelect(file, imageElement);
        }
    }
</script>

<div class="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
    <Navbar />

    <main class="min-h-screen flex items-center justify-center py-4 sm:py-6 md:py-8">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#if !imageFile}
            <div class="mx-auto px-4">
                <div class="border border-[#322018] rounded-xl p-6 sm:p-8 md:p-12 lg:p-16 xl:p-24 shadow-[5px_5px_0px_0px_rgba(50,32,24)] text-center" on:dragover|preventDefault on:drop={handleDrop}>
                    <div class="mb-6 sm:mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[#322018]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Drag your photo here</h2>
                    <p class="text-[#322018]/60 mb-6 sm:mb-8">or select from your computer</p>

                    <label class="bg-[#322018] text-[#e6d8c2] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl cursor-pointer hover:bg-[#322018]/90 transition-colors inline-block text-sm sm:text-base">
                        Select Photo
                        <input type="file" accept="image/*" class="hidden" on:change={handleChange} />
                    </label>
                </div>
            </div>
        {:else}
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2">
                        <div class="border border-[#322018] rounded-xl shadow-[5px_5px_0px_0px_rgba(50,32,24)] p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-xl font-bold">Edited Photo</h2>
                                <button on:click={() => { imageFile = null; imageLoaded = false; resetFilters(); }} class="text-[#322018]/60 hover:text-[#322018] transition-colors hover:cursor-pointer">
                                    Select another photo
                                </button>
                            </div>
                            <div class="overflow-auto">
                                <canvas bind:this={editedCanvas} class="max-w-full border border-[#322018]/10 rounded-xl"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="border border-[#322018] rounded-xl shadow-[5px_5px_0px_0px_rgba(50,32,24)] p-6">
                            <h2 class="text-xl font-bold mb-6">Editing Tools</h2>

                            <div class="space-y-4">
                                <details class="group">
                                    <summary class="flex justify-between items-center cursor-pointer py-2 text-lg font-medium border-b border-[#322018]/10">
                                        <span>Basic Settings</span>
                                        <svg class="w-5 h-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </summary>
                                    <!-- svelte-ignore a11y_label_has_associated_control -->
                                    <div class="pt-4 space-y-4">
                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Exposure</span>
                                                <span class="text-[#322018]/60">{filters.exposure}</span>
                                            </label>
                                            <input type="range" min="-100" max="100" bind:value={filters.exposure} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Brightness</span>
                                                <span class="text-[#322018]/60">{filters.brightness}</span>
                                            </label>
                                            <input type="range" min="-50" max="50" bind:value={filters.brightness} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Contrast</span>
                                                <span class="text-[#322018]/60">{filters.contrast}</span>
                                            </label>
                                            <input type="range" min="-50" max="50" bind:value={filters.contrast} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Highlights</span>
                                                <span class="text-[#322018]/60">{filters.highlights}</span>
                                            </label>
                                            <input type="range" min="-100" max="100" bind:value={filters.highlights} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Shadows</span>
                                                <span class="text-[#322018]/60">{filters.shadows}</span>
                                            </label>
                                            <input type="range" min="-100" max="100" bind:value={filters.shadows} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>
                                    </div>
                                </details>

                                <details class="group">
                                    <summary class="flex justify-between items-center cursor-pointer py-2 text-lg font-medium border-b border-[#322018]/10">
                                        <span>Color Settings</span>
                                        <svg class="w-5 h-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </summary>
                                    <!-- svelte-ignore a11y_label_has_associated_control -->
                                    <div class="pt-4 space-y-4">
                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Saturation</span>
                                                <span class="text-[#322018]/60">{filters.saturation}</span>
                                            </label>
                                            <input type="range" min="-100" max="100" bind:value={filters.saturation} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Vibrance</span>
                                                <span class="text-[#322018]/60">{filters.vibrance}</span>
                                            </label>
                                            <input type="range" min="-100" max="100" bind:value={filters.vibrance} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Hue</span>
                                                <span class="text-[#322018]/60">{filters.hue}</span>
                                            </label>
                                            <input type="range" min="-180" max="180" bind:value={filters.hue} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Color Temperature</span>
                                                <span class="text-[#322018]/60">{filters.temperature}</span>
                                            </label>
                                            <input type="range" min="-50" max="50" bind:value={filters.temperature} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>
                                    </div>
                                </details>

                                <details class="group">
                                    <summary class="flex justify-between items-center cursor-pointer py-2 text-lg font-medium border-b border-[#322018]/10">
                                        <span>Detail Settings</span>
                                        <svg class="w-5 h-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </summary>
                                    <!-- svelte-ignore a11y_label_has_associated_control -->
                                    <div class="pt-4 space-y-4">
                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Sharpness</span>
                                                <span class="text-[#322018]/60">{filters.sharpness}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.sharpness} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Blur</span>
                                                <span class="text-[#322018]/60">{filters.blur}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.blur} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Noise</span>
                                                <span class="text-[#322018]/60">{filters.noise}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.noise} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>
                                    </div>
                                </details>

                                <details class="group">
                                    <summary class="flex justify-between items-center cursor-pointer py-2 text-lg font-medium border-b border-[#322018]/10">
                                        <span>Effects</span>
                                        <svg class="w-5 h-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </summary>
                                    <!-- svelte-ignore a11y_label_has_associated_control -->
                                    <div class="pt-4 space-y-4">
                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Sepia</span>
                                                <span class="text-[#322018]/60">{filters.sepia}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.sepia} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Black & White</span>
                                                <span class="text-[#322018]/60">{filters.grayscale}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.grayscale} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Invert</span>
                                                <span class="text-[#322018]/60">{filters.invert}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.invert} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>
                                    </div>
                                </details>

                                <details class="group">
                                    <summary class="flex justify-between items-center cursor-pointer py-2 text-lg font-medium border-b border-[#322018]/10">
                                        <span>Creative Effects</span>
                                        <svg class="w-5 h-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </summary>
                                    <!-- svelte-ignore a11y_label_has_associated_control -->
                                    <div class="pt-4 space-y-4">
                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Pixelate</span>
                                                <span class="text-[#322018]/60">{filters.pixelate}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.pixelate} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Glitch Intensity</span>
                                                <span class="text-[#322018]/60">{filters.glitchIntensity}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.glitchIntensity} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Glitch Offset</span>
                                                <span class="text-[#322018]/60">{filters.glitchOffset}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.glitchOffset} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Dream Effect</span>
                                                <span class="text-[#322018]/60">{filters.dreamEffect}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.dreamEffect} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Mosaic</span>
                                                <span class="text-[#322018]/60">{filters.mosaicSize}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.mosaicSize} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Pencil Effect</span>
                                                <span class="text-[#322018]/60">{filters.pencilEffect}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.pencilEffect} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Watercolor Effect</span>
                                                <span class="text-[#322018]/60">{filters.watercolorEffect}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.watercolorEffect} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Kaleidoscope</span>
                                                <span class="text-[#322018]/60">{filters.kaleidoscope}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.kaleidoscope} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Fractalize</span>
                                                <span class="text-[#322018]/60">{filters.fractalize}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.fractalize} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Vignette</span>
                                                <span class="text-[#322018]/60">{filters.vignette}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.vignette} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>
                                    </div>
                                </details>

                                <details class="group">
                                    <summary class="flex justify-between items-center cursor-pointer py-2 text-lg font-medium border-b border-[#322018]/10">
                                        <span>Advanced Effects</span>
                                        <svg class="w-5 h-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                    </summary>
                                    <!-- svelte-ignore a11y_label_has_associated_control -->
                                    <div class="pt-4 space-y-4">
                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Neon Brightness</span>
                                                <span class="text-[#322018]/60">{filters.neonGlow}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.neonGlow} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Neon Color</span>
                                                <span class="text-[#322018]/60">{filters.neonColor}</span>
                                            </label>
                                            <input type="range" min="0" max="360" bind:value={filters.neonColor} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Oil Paint</span>
                                                <span class="text-[#322018]/60">{filters.oilPaint}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.oilPaint} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Pop Art</span>
                                                <span class="text-[#322018]/60">{filters.popArt}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.popArt} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Retro Film</span>
                                                <span class="text-[#322018]/60">{filters.retroFilm}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.retroFilm} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Retro Tint</span>
                                                <span class="text-[#322018]/60">{filters.retroTint}</span>
                                            </label>
                                            <input type="range" min="0" max="360" bind:value={filters.retroTint} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>3D Anaglyph</span>
                                                <span class="text-[#322018]/60">{filters.anaglyph3d}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.anaglyph3d} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>3D Depth</span>
                                                <span class="text-[#322018]/60">{filters.anaglyphOffset}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.anaglyphOffset} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Light Leak</span>
                                                <span class="text-[#322018]/60">{filters.lightLeak}</span>
                                            </label>
                                            <input type="range" min="0" max="100" bind:value={filters.lightLeak} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>

                                        <div>
                                            <label class="flex justify-between mb-2">
                                                <span>Light Leak Color</span>
                                                <span class="text-[#322018]/60">{filters.lightLeakColor}</span>
                                            </label>
                                            <input type="range" min="0" max="360" bind:value={filters.lightLeakColor} class="w-full h-2 bg-[#e6d8c2] rounded-xl appearance-none cursor-pointer accent-[#322018] hover:accent-[#322018]/80 transition-all" />
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="flex justify-between gap-4 mt-6">
                                <button on:click={resetFilters} class="flex-1 bg-[#322018]/10 text-[#322018] px-4 py-3 rounded-xl hover:cursor-pointer">
                                    Reset
                                </button>

                                <button
                                    on:click={() => {
                                        const link = document.createElement('a');
                                        link.download = 'edited-image.png';
                                        link.href = editedCanvas.toDataURL('image/png');
                                        link.click();
                                    }}
                                    class="flex-1 bg-[#322018] text-[#e6d8c2] px-4 py-3 rounded-xl hover:cursor-pointer hover:bg-[#322018]/90 transition-colors"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </main>

    <Footer />
</div>
