"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';

// 스켈레톤 UI 컴포넌트
function ImageSkeleton() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, rgba(30, 30, 30, 0.8) 0%, rgba(50, 50, 60, 0.6) 50%, rgba(30, 30, 30, 0.8) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

const CATEGORIES = ['ALL', '유튜브', '전시', 'K-POP', '드라마', '영화', '웹툰', '웹소설', '공연', '굿즈', '스타트업'];

export default function Market() {
  const { products } = useStore();
  const [activeCat, setActiveCat] = useState('ALL');
  
  // StoreContext의 products를 필터링 (category 기준)
  const filtered = activeCat === 'ALL' 
    ? products 
    : products.filter(p => p.category === activeCat);

  return (
    <div className="bg-background" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
      
      <div style={{ marginTop: '80px', padding: '0 5%', maxWidth: '1200px', margin: '80px auto 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} 
              className={activeCat === cat ? '' : 'text-gray-500'}
              style={{ 
                padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                backgroundColor: activeCat === cat ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: activeCat === cat ? 'white' : '#6B7280', fontWeight: 'bold'
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '0 5%', maxWidth: '1400px', margin: '0 auto' }}>
        {filtered.map((p) => (
          <Link href={`/active-invest/product/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div 
              className="group"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(124, 58, 237, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div style={{ position: 'relative', height: '200px', backgroundColor: 'rgba(20, 20, 30, 0.8)', overflow: 'hidden' }}>
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                  {p.category}
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '15px', 
                  marginBottom: '8px', 
                  lineHeight: '1.4',
                  color: 'var(--text-primary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {p.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {p.price.toLocaleString()}원
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: parseFloat(p.yield) > 0 ? 'var(--up-color)' : 'var(--down-color)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: parseFloat(p.yield) > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  }}>
                    {parseFloat(p.yield) > 0 ? '+' : ''}{p.yield}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
