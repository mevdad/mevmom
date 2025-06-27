<script lang="ts">
    const faqs = [
        {
            question: "What is cryptocurrency market making?",
            answer: "Cryptocurrency market making is the process of providing liquidity to the market by simultaneously placing buy and sell orders, reducing the spread and increasing trading volume."
        },
        {
            question: "How does your automation service work?",
            answer: "Our service uses advanced algorithms to automatically place and manage orders on various crypto exchanges, optimizing market-making strategies in real-time."
        },
        {
            question: "Which exchanges does your service support?",
            answer: "We support all major crypto exchanges, including Binance, Coinbase Pro, Kraken, KuCoin, Bitfinex, and others. The full list is available in your personal account."
        },
        {
            question: "Do I need a technical background to use the platform?",
            answer: "No, our platform is designed with simplicity in mind. We provide an intuitive interface and detailed documentation for users of any skill level."
        }
    ]
    
    let activeIndex: boolean[] = [...Array(faqs.length).fill(false)]
    
    function toggle(i: number) {
        activeIndex[i] = !activeIndex[i]
    }
</script>

<section id="faq" class="faq">
    <div class="container">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
            {#each faqs as faq, i}
                <div class="faq-item">
                    <button class="question" onclick={() => toggle(i)}>
                        {faq.question}
                        <span class="icon" class:rotate={activeIndex[i]}>+</span>
                    </button>
                    <div class="answer" class:active={activeIndex[i]}>{faq.answer}</div>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .faq {
        background: #f3f4f6;
    }

    .faq-list {
        max-width: 800px;
        margin: 0 auto;
    }

    .faq-item {
        margin-bottom: 15px;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .question {
        width: 100%;
        text-align: left;
        padding: 20px;
        cursor: pointer;
        border: none;
        background: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 1rem;
    }

    .question .icon {
        font-size: 1.5rem;
        transition: transform 0.3s ease;
    }

    .icon.rotate {
        transform: rotate(45deg);
    }

    .answer {
        padding: 0 20px;
        max-height: 0;
        overflow: hidden;
        transition: all 0.3s ease;
        color: #4b5563;
    }

    .answer.active {
        max-height: 300px;
        padding: 20px;
        border-top: 1px solid #f0f0f0;
    }
</style>