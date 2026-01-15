"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Wallet() {
  const { userCash, holdings, history, sellStock } = useStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 총 평가 자산 계산
  const totalAssets = useMemo(() => {
    const holdingsValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    return userCash + holdingsValue;
  }, [userCash, holdings]);

  // 전일 대비 수익률 계산 (임시로 총 수익률 사용)
  const totalReturn = useMemo(() => {
    const holdingsValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const holdingsCost = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
    if (holdingsCost === 0) return { amount: 0, rate: 0 };
    const returnAmount = holdingsValue - holdingsCost;
    const returnRate = (returnAmount / holdingsCost) * 100;
    return { amount: returnAmount, rate: returnRate };
  }, [holdings]);

  // 수익률 그래프 데이터 생성 (최근 30일)
  const returnChartData = useMemo(() => {
    if (holdings.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({
        date: `${i + 1}일`,
        return: 0,
      }));
    }
    
    const baseReturn = totalReturn.rate;
    return Array.from({ length: 30 }, (_, i) => {
      const variation = Math.sin(i / 5) * 5;
      return {
        date: `${i + 1}일`,
        return: Math.max(0, baseReturn + variation),
      };
    });
  }, [holdings, totalReturn.rate]);

  // Toast 자동 닫기
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // 매도 함수
  const handleSell = (holding: typeof holdings[0]) => {
    // 1주 매도
    const sellPrice = holding.currentPrice;
    const success = sellStock({ name: holding.name, id: holding.id, price: sellPrice }, 1);
    
    if (success) {
      setToastMessage(`🎉 수익 실현 완료! (+${sellPrice.toLocaleString()}원)`);
      setShowToast(true);
    } else {
      setToastMessage('매도에 실패했습니다.');
      setShowToast(true);
    }
  };

  return (
    <div className="bg-background" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          backgroundColor: 'var(--card-bg)',
          padding: '12px 24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          color: 'var(--text-primary)',
          fontWeight: 'bold',
          animation: 'popUp 0.4s ease-out'
        }}>
          {toastMessage}
        </div>
      )}
      
      <div style={{ marginTop: '80px', padding: '20px', maxWidth: '1200px', margin: '80px auto 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', color: 'var(--text-primary)' }}>내 자산 현황</h1>
        
        {/* 총 자산 카드 - 아주 크게 표시 */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '40px', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>총 평가 자산</div>
          <div style={{ fontSize: '48px', fontWeight: '900', margin: '15px 0', color: 'var(--text-primary)' }}>
            {totalAssets.toLocaleString()}원
          </div>
          {totalReturn.rate !== 0 && (
            <div style={{ 
              color: totalReturn.amount >= 0 ? 'var(--up-color)' : 'var(--down-color)', 
              fontWeight: 'bold',
              fontSize: '18px',
            }}>
              {totalReturn.amount >= 0 ? '+' : ''}{totalReturn.rate.toFixed(2)}% 
              <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                ({totalReturn.amount >= 0 ? '+' : ''}{totalReturn.amount.toLocaleString()}원)
              </span>
            </div>
          )}
          <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>예수금</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '16px' }}>{userCash.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>보유 종목 평가액</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '16px' }}>
                {holdings.reduce((sum, h) => sum + h.currentValue, 0).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 수익률 그래프 */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px' }}>수익률 추이</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={returnChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                stroke="var(--border-color)"
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                stroke="var(--border-color)"
                label={{ value: '수익률 (%)', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-secondary)', fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="return" 
                stroke="var(--up-color)" 
                strokeWidth={2}
                dot={{ fill: 'var(--up-color)', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 보유 상품 목록 */}
        <h3 style={{ marginTop: '40px', marginBottom: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>보유 상품 목록</h3>
        {holdings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>보유 중인 상품이 없습니다.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
            {holdings.map((holding) => {
              const cost = holding.avgPrice * holding.quantity;
              const profit = holding.currentValue - cost;
              const profitRate = (profit / cost) * 100;
              
  return (
                <div key={holding.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '20px', 
                  backgroundColor: 'var(--card-bg)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '16px', marginBottom: '8px' }}>{holding.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{holding.quantity}주 보유</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      평균단가: {holding.avgPrice.toLocaleString()}원
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>
                      {holding.currentValue.toLocaleString()}원
                    </div>
                    <div style={{ 
                      color: profit >= 0 ? 'var(--up-color)' : 'var(--down-color)', 
                      fontSize: '14px', 
                      fontWeight: 'bold' 
                    }}>
                      {profit >= 0 ? '+' : ''}{profitRate.toFixed(2)}% 
                      <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                        ({profit >= 0 ? '+' : ''}{profit.toLocaleString()}원)
                      </span>
                    </div>
                    <button
                      onClick={() => handleSell(holding)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ec4899',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginTop: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#db2777';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ec4899';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      매도
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 최근 거래 내역 - 토스 스타일 */}
        <h3 style={{ marginTop: '40px', marginBottom: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>최근 거래 내역</h3>
        {history.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>거래 내역이 없습니다.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {history.slice(0, 20).map((tx, index) => (
              <div 
                key={tx.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px 20px',
                  backgroundColor: 'var(--card-bg)',
                  borderBottom: index < Math.min(history.length, 20) - 1 ? '1px solid var(--border-color)' : 'none',
                  borderTopLeftRadius: index === 0 ? '12px' : '0',
                  borderTopRightRadius: index === 0 ? '12px' : '0',
                  borderBottomLeftRadius: index === Math.min(history.length, 20) - 1 ? '12px' : '0',
                  borderBottomRightRadius: index === Math.min(history.length, 20) - 1 ? '12px' : '0',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ 
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: tx.type === '매수' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      {tx.type === '매수' ? '📈' : '📉'}
                    </div>
                    <div style={{ marginLeft: '8px' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '15px' }}>{tx.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {tx.date}
                      </div>
                    </div>
          </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '48px' }}>
                    {tx.qty}주 × {tx.price.toLocaleString()}원
          </div>
        </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    color: tx.type === '매수' ? 'var(--up-color)' : 'var(--down-color)',
                  }}>
                    {tx.type === '매수' ? '-' : '+'}{tx.total.toLocaleString()}원
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: tx.type === '매수' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    display: 'inline-block',
                  }}>
                    {tx.type}
          </div>
        </div>
      </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
