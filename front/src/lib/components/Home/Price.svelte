<script lang="ts">
    const plans = [
        {
            name: "Basic",
            price: "199",
            period: "month",
            features: [
                "Basic market making algorithms",
                "Support for 5 popular cryptocurrencies",
                "Daily reports",
                "Email support"
            ],
            recommended: false
        },
        {
            name: "Pro",
            price: "499",
            period: "month",
            features: [
                "Advanced algorithms",
                "Support for 20+ cryptocurrencies",
                "Real-time analytics",
                "Priority support 24/7",
                "API integration"
            ],
            recommended: true
        },
        {
            name: "Enterprise",
            price: "1499",
            period: "month",
            features: [
                "Custom strategies",
                "Unlimited cryptocurrencies",
                "Dedicated infrastructure",
                "Personal manager",
                "White label solution"
            ],
            recommended: false
        }
    ]
</script>

<section id="pricing" class="pricing">
    <div class="container">
        <h2>Choose the Right Plan</h2>
        <div class="pricing-cards">
            {#each plans as plan}
                <div class="pricing-card {plan.recommended ? 'recommended' : ''}">
                    {#if plan.recommended}
                        <div class="badge">Popular</div>
                    {/if}
                    <h3>{plan.name}</h3>
                    <div class="price">
                        <span class="currency">$</span>
                        <span class="amount">{plan.price}</span>
                        <span class="period">/{plan.period}</span>
                    </div>
                    <ul class="features-list">
                        {#each plan.features as feature}
                            <li>{feature}</li>
                        {/each}
                    </ul>
                    <a href="/register" class="btn {plan.recommended ? 'primary' : 'secondary'}">Select Plan</a>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .pricing {
        background: #f3f4f6;
    }

    .pricing-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }

    .pricing-card {
        background: white;
        border-radius: 8px;
        padding: 40px 30px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        position: relative;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .pricing-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    }

    .pricing-card.recommended {
        border: 2px solid #3b82f6;
    }

    .pricing-card .badge {
        position: absolute;
        top: -15px;
        right: 50%;
        transform: translateX(50%);
        background: #3b82f6;
        color: white;
        padding: 5px 15px;
        border-radius: 30px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .pricing-card h3 {
        margin-bottom: 20px;
    }

    .price {
        margin-bottom: 30px;
    }

    .price .currency {
        font-size: 1.5rem;
        vertical-align: top;
    }

    .price .amount {
        font-size: 3rem;
        font-weight: 700;
    }

    .price .period {
        color: #6b7280;
    }

    .features-list {
        list-style: none;
        padding: 0;
        margin: 0 0 30px;
        text-align: left;
    }

    .features-list li {
        padding: 10px 0;
        border-bottom: 1px solid #f3f4f6;
    }

    .features-list li:before {
        content: "✓";
        color: #3b82f6;
        margin-right: 8px;
        font-weight: bold;
    }
</style>