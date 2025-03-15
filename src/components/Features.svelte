<script>
    let features = [
        {
            title: "Intuitive Interface",
            description: "Our photo editor features a user-friendly interface that makes it easy to navigate and use, even for beginners."
        },
        {
            title: "Open Source",
            description: "Our photo editor is open source, which means you can see and modify the code to fit your needs."
        },
        {
            title: "Free",
            description: "Our photo editor is free to use, and will always be free."
        }
    ];
</script>

<div class="flex flex-col gap-4 sm:gap-6 py-12 sm:py-16 md:py-20">
    <h1 class="text-3xl sm:text-4xl font-bold text-center">Features</h1>
    <p class="text-lg sm:text-xl text-center max-w-2xl mx-auto">Our photo editor is packed with powerful features that will help you unleash your creativity.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
        {#each features as feature}
        <div class="p-4 sm:p-6 border border-[#322018] rounded-xl shadow-[5px_5px_0px_0px_rgba(50,32,24)]">
            <div class="flex flex-col items-center text-center">
                <div>
                    <h3 class="text-xl sm:text-2xl font-bold mb-2">{feature.title}</h3>
                    <p class="text-base sm:text-lg">{feature.description}</p>
                </div>
            </div>
        </div>
        {/each}
    </div>
</div>