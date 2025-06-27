<section id="features" class="features">
    <div class="container">
        <h2>Benefits of Our Platform</h2>
        <div class="feature-cards">
            <div class="feature-card">
                <div class="icon">📈</div>
                <h3>Algorithmic Market Making</h3>
                <p>Our algorithms analyze the market in real-time and automatically adjust strategies for maximum efficiency</p>
            </div>
            <div class="feature-card">
                <div class="icon">🛡️</div>
                <h3>Risk Management</h3>
                <p>Built-in protection mechanisms against market volatility and risk control to preserve your capital</p>
            </div>
            <div class="feature-card">
                <div class="icon">🔄</div>
                <h3>Cross-exchange Integration</h3>
                <p>Simultaneous operation on multiple exchanges from a single control panel</p>
            </div>
            <div class="feature-card">
                <div class="icon">📊</div>
                <h3>Detailed Analytics</h3>
                <p>Detailed reports on performance and results of algorithm operation</p>
            </div>
        </div>
    </div>
</section>

<style>
    .features {
        background: #fff;
    }

    .feature-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 30px;
    }

    .feature-card {
        background: #f9fafb;
        border-radius: 8px;
        padding: 30px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .feature-card .icon {
        font-size: 2rem;
        margin-bottom: 15px;
    }

    .feature-card h3 {
        margin-bottom: 15px;
    }

    @media (max-width: 768px) {
        .feature-cards {
            grid-template-columns: 1fr;
        }
    }
</style>