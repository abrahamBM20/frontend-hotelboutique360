import React from 'react';

export const ReportsView: React.FC = () => {
  // Mock de datos para el reporte
  const kpiData = {
    totalRevenue: 45250,
    occupancyRate: 85,
    adr: 120, // Average Daily Rate (Tarifa Media Diaria)
    revPar: 102, // Revenue Per Available Room (Ingreso por Habitación Disponible)
  };

  const revenueByRoomType = [
    { type: 'SUITE', bookings: 45, revenue: 18500 },
    { type: 'DOUBLE', bookings: 120, revenue: 15600 },
    { type: 'SINGLE', bookings: 85, revenue: 6800 },
    { type: 'PRESIDENCIAL', bookings: 5, revenue: 4350 },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#3b0764', margin: 0 }}>Reportes y Analíticas</h2>
        <p style={{ color: '#6b21a8', marginTop: '5px' }}>Indicadores clave de rendimiento (KPIs) del mes actual.</p>
      </div>

      {/* Tarjetas Superiores de KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Ingresos Totales</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b0764', margin: '0' }}>
            ${kpiData.totalRevenue.toLocaleString()} <span style={{ fontSize: '1rem' }}>USD</span>
          </p>
          <p style={{ color: '#10b981', fontSize: '0.85rem', margin: '5px 0 0 0', fontWeight: 'bold' }}>↑ +12.5% vs mes anterior</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3b0764' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Ocupación</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b0764', margin: '0' }}>{kpiData.occupancyRate}%</p>
          
          {/* Barra de progreso CSS */}
          <div style={{ width: '100%', backgroundColor: '#f3e8ff', height: '8px', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${kpiData.occupancyRate}%`, backgroundColor: '#3b0764', height: '100%' }}></div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>ADR (Tarifa Media)</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b0764', margin: '0' }}>
            ${kpiData.adr} <span style={{ fontSize: '1rem' }}>USD</span>
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3b0764' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>RevPAR</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b0764', margin: '0' }}>
            ${kpiData.revPar} <span style={{ fontSize: '1rem' }}>USD</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Gráfico de barras simulado (Ingresos por tipo) */}
        <div className="card">
          <h3 style={{ color: '#3b0764', marginTop: 0, marginBottom: '20px' }}>Ingresos por Tipo de Habitación</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {revenueByRoomType.map((item) => {
              const percentage = (item.revenue / kpiData.totalRevenue) * 100;
              return (
                <div key={item.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#3b0764', fontWeight: 'bold' }}>
                    <span>{item.type}</span>
                    <span>${item.revenue.toLocaleString()} USD</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#f3e8ff', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, backgroundColor: '#8b5cf6', height: '100%', transition: 'width 1s ease-in-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla de Desglose */}
        <div className="card">
          <h3 style={{ color: '#3b0764', marginTop: 0, marginBottom: '20px' }}>Desglose de Reservas</h3>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Categoría</th>
                <th style={{ textAlign: 'center' }}>Total Reservas</th>
                <th style={{ textAlign: 'right' }}>Ingreso Bruto</th>
              </tr>
            </thead>
            <tbody>
              {revenueByRoomType.map((item) => (
                <tr key={`table-${item.type}`}>
                  <td style={{ fontWeight: 'bold', color: '#6b21a8' }}>{item.type}</td>
                  <td style={{ textAlign: 'center' }}>{item.bookings}</td>
                  <td style={{ textAlign: 'right' }}>${item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};