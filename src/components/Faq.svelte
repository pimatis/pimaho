<script lang="ts">
    import { slide } from "svelte/transition";

    let faqs = [
        {
            question: "Is Pimaho really free to use?",
            answer: "Yes, Pimaho is completely free to use and will always remain free. There are no hidden costs or premium features locked behind a paywall."
        },
        {
            question: "Do I need coding experience to use Pimaho?",
            answer: "Not at all! Pimaho is designed with an intuitive interface that makes it accessible to users of all skill levels, from beginners to professional photographers."
        },
        {
            question: "Can I contribute to the Pimaho project?",
            answer: "Absolutely! As an open source project, we welcome contributions from the community. You can find our repository on GitHub and submit pull requests or report issues."
        },
        {
            question: "What image formats does Pimaho support?",
            answer: "Pimaho supports all common image formats including JPG, PNG, SVG, GIF, and more. We're constantly working to expand format compatibility."
        },
        {
            question: "Is Pimaho available on all platforms?",
            answer: "Pimaho is designed to be cross-platform compatible, allowing you to edit your photos whether you're using Windows, macOS, or Linux."
        },
        {
            question: "How does Pimaho compare to paid photo editors?",
            answer: "While paid editors may offer some specialized features, Pimaho provides all essential editing tools most users need. Our community-driven development means we're constantly improving based on real user feedback."
        }
    ];

    let activeIndex: number | null = null;
    
    function toggleFaq(index: number) {
        activeIndex = activeIndex === index ? null : index;
    }
</script>

<div class="flex flex-col gap-4 sm:gap-6 py-12 sm:py-16 md:py-20">
    <h1 class="text-3xl sm:text-4xl font-bold text-center">Frequently Asked Questions</h1>
    <p class="text-lg sm:text-xl text-center max-w-2xl mx-auto">Find answers to common questions about our photo editor.</p>

    <div class="flex flex-col gap-3 sm:gap-4 mt-4">
        {#each faqs as faq, index}
            <div class="border border-[#322018] rounded-xl shadow-[5px_5px_0px_0px_rgba(50,32,24)] overflow-hidden">
                <button class="w-full p-4 sm:p-6 text-left flex justify-between items-center hover:cursor-pointer"  on:click={() => toggleFaq(index)}>
                    <h3 class="text-lg sm:text-xl font-bold pr-4">{faq.question}</h3>
                    <span class="text-xl sm:text-2xl flex-shrink-0">{activeIndex === index ? '−' : '+'}</span>
                </button>
                {#if activeIndex === index}
                     <div class="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-[#322018]" transition:slide>
                        <p class="mt-3 sm:mt-4 text-base sm:text-lg">{faq.answer}</p>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>