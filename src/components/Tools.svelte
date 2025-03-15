<script lang="ts">
    let tools = [
        {
            title: "Color Adjustments",
            description: "Fine-tune hue, saturation, and brightness with precision controls for perfect color balance."
        },
        {
            title: "Color Balance",
            description: "Adjust the relationship between colors with RGB and CMYK sliders for professional-grade color correction."
        },
        {
            title: "Quality Enhancement",
            description: "Sharpen details, reduce noise, and enhance clarity with our advanced image processing algorithms."
        },
        {
            title: "Filters & Effects",
            description: "Apply artistic filters and special effects to transform your images with a single click."
        },
        {
            title: "Layer Management",
            description: "Work with multiple layers to create complex compositions with non-destructive editing capabilities."
        },
        {
            title: "Selection Tools",
            description: "Precisely select areas with smart selection tools, magic wand, and brush-based selections."
        }
    ];
</script>

<div class="flex flex-col gap-4 sm:gap-6 py-12 sm:py-16 md:py-20">
    <h1 class="text-3xl sm:text-4xl font-bold text-center">Powerful Editing Tools</h1>
    <p class="text-lg sm:text-xl text-center max-w-2xl mx-auto">Explore our comprehensive suite of professional-grade editing tools designed for creators of all levels.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
        {#each tools as tool}
        <div class="p-4 sm:p-6 border border-[#322018] rounded-xl shadow-[5px_5px_0px_0px_rgba(50,32,24)]">
            <div class="flex flex-col items-center text-center">
                <div>
                    <h3 class="text-xl sm:text-2xl font-bold mb-2">{tool.title}</h3>
                    <p class="text-base sm:text-lg">{tool.description}</p>
                </div>
            </div>
        </div>
        {/each}
    </div>
    
    <div class="mt-8 sm:mt-12 border border-[#322018] rounded-xl shadow-[5px_5px_0px_0px_rgba(50,32,24)] p-4 sm:p-6 bg-[#e6d8c2]/10">
        <h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Can't find what you need?</h3>
        <p class="mb-4 text-base sm:text-lg">Our open-source community is constantly developing new tools and features. If there's something specific you're looking for, join our community and suggest it!</p>
        <a href="https://github.com/pimatis/pimaho" class="inline-block bg-[#322018] text-[#e6d8c2] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg">
            Join the Community
        </a>
    </div>
</div>
