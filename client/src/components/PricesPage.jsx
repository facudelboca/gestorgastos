import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BitcoinIcon, Activity } from 'lucide-react';

const PricesPage = () => {
  const [prices, setPrices] = useState({
    usd: null,
    btc: null,
    eth: null,
    stocks: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrices();
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);

      // Obtener precios de criptomonedas desde CoinGecko (sin autenticación)
      const cryptoRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true'
      );
      const cryptoData = await cryptoRes.json();

      setPrices((prev) => ({
        ...prev,
        btc: {
          price: cryptoData.bitcoin.usd,
          change: cryptoData.bitcoin.usd_24h_change,
          marketCap: cryptoData.bitcoin.usd_market_cap,
        },
        eth: {
          price: cryptoData.ethereum.usd,
          change: cryptoData.ethereum.usd_24h_change,
          marketCap: cryptoData.ethereum.usd_market_cap,
        },
      }));

      // Obtener tipo de cambio USD/ARS desde exchangerate-api
      const usdRes = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      const usdData = await usdRes.json();

      const arsRate = usdData.rates.ARS || 0;
      setPrices((prev) => ({
        ...prev,
        usd: {
          rate: arsRate,
          timestamp: new Date().toLocaleTimeString('es-ES'),
        },
      }));

      setError(null);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('No se pudieron cargar los precios');
    } finally {
      setLoading(false);
    }
  };

  const PriceCard = ({ title, icon: Icon, price, change, secondary, color }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        </div>
      </div>

      <div className="space-y-2">
        {price !== null && (
          <>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${price.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {Math.abs(change).toFixed(2)}% (24h)
              </div>
            )}
            {secondary && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                {secondary}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity size={28} className="text-blue-600" />
          Precios de Mercado
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Datos actualizados en tiempo real • Últimas 24 horas
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && prices.btc && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bitcoin */}
          <PriceCard
            title="Bitcoin"
            icon={BitcoinIcon}
            price={prices.btc.price}
            change={prices.btc.change}
            secondary={
              prices.btc.marketCap
                ? `Market Cap: $${(prices.btc.marketCap / 1e9).toFixed(1)}B`
                : undefined
            }
            color="bg-orange-600"
          />

          {/* Ethereum */}
          <PriceCard
            title="Ethereum"
            icon={BitcoinIcon}
            price={prices.eth.price}
            change={prices.eth.change}
            secondary={
              prices.eth.marketCap
                ? `Market Cap: $${(prices.eth.marketCap / 1e9).toFixed(1)}B`
                : undefined
            }
            color="bg-purple-600"
          />

          {/* USD/ARS */}
          {prices.usd && (
            <PriceCard
              title="USD → ARS"
              icon={DollarSign}
              price={prices.usd.rate}
              secondary={`Actualizado: ${prices.usd.timestamp}`}
              color="bg-green-600"
            />
          )}
        </div>
      )}

      {/* Investment Recommendation */}
      {!loading && prices.btc && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Recomendaciones de inversión
          </h3>
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <p>
              💡 <strong>Bitcoin</strong> es la criptomoneda más establecida y con mayor capitalización de
              mercado.
            </p>
            <p>
              💡 <strong>Ethereum</strong> ofrece una plataforma para aplicaciones descentralizadas con mayor
              volatilidad.
            </p>
            <p>
              💡 Considera tu perfil de riesgo y consulta con un asesor financiero antes de invertir.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Nota: Los precios son informativos. No constituyen asesoramiento financiero.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricesPage;
