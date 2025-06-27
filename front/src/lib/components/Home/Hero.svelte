<script lang="ts">
    import chainImg from "$img/chain.svg"
</script>

<section class="hero">
    <div class="container">
        <div class="hero-content">
            <h1 class="text-2xl font-bold text-gray-900">Automated Cryptocurrency Market Making</h1>
            <p class="subtitle">Increase liquidity and optimize trading strategies with our advanced algorithms</p>
            <div class="cta-buttons">
                <a href="/register" class="btn primary">Start for Free</a>
            </div>
        </div>
        <div class="hero-image">
            <img src="{chainImg}" alt="Cryptocurrency Chart" />
        </div>
    </div>
</section>

<style>
    .hero {
        padding-top: 150px;
        padding-bottom: 80px;
        background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    }

    .hero .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .hero-content {
        flex: 1;
    }

    .hero-image {
        flex: 1;
        display: flex;
        justify-content: flex-end;
    }

    .hero-image img {
        max-width: 100%;
        height: auto;
    }

    .subtitle {
        font-size: 1.25rem;
        color: #6b7280;
        margin-bottom: 1.5rem;
    }

    .cta-buttons {
        display: flex;
        gap: 15px;
    }

    @media (max-width: 992px) {

        .hero .container {
            flex-direction: column;
            gap: 40px;
        }
        
        .hero-content, .hero-image {
            text-align: center;
            justify-content: center;
        }
        
        .cta-buttons {
            justify-content: center;
        }
    }

    @media (max-width: 768px) {
        .hero {
            padding-top: 200px;
        }
    }

    @media (max-width: 480px) {
        .cta-buttons {
            flex-direction: column;
            width: 100%;
        }
    }
</style>