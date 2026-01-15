"use client";

import { useState } from "react";
import { Trophy, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RankingPage() {
  const rankings = [
    { rank: 1, name: "웹툰 <나 혼자 만렙>", yield: "+45.2%", change: "+3.2%", category: "웹툰" },
    { rank: 2, name: "K-POP <Sparkle> 데뷔", yield: "+38.5%", change: "+2.8%", category: "K-POP" },
    { rank: 3, name: "드라마 <한방의 추억>", yield: "+32.1%", change: "+1.9%", category: "드라마" },
    { rank: 4, name: "유튜브 <Traveler> 채널", yield: "+28.7%", change: "+1.5%", category: "유튜브" },
    { rank: 5, name: "웹소설 <재벌집 막내>", yield: "+25.3%", change: "+1.2%", category: "웹소설" },
    { rank: 6, name: "영화 <새벽의 질주>", yield: "+22.4%", change: "+0.9%", category: "영화" },
    { rank: 7, name: "전시회 <빛의 벙커>", yield: "+18.9%", change: "+0.7%", category: "전시" },
    { rank: 8, name: "뮤지컬 <영웅>", yield: "+15.6%", change: "+0.5%", category: "공연" },
    { rank: 9, name: "굿즈 <냥냥이>", yield: "+12.3%", change: "+0.3%", category: "굿즈" },
    { rank: 10, name: "스타트업 <Future>", yield: "+8.7%", change: "+0.2%", category: "스타트업" },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '128px', paddingBottom: '120px' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <Trophy className="mx-auto mb-4" size={48} color="var(--accent-color)" />
          <h1 className="text-4xl font-bold text-foreground mb-4">실시간 투자 랭킹</h1>
          <p className="text-muted-foreground text-lg">
            지금 가장 높은 수익률을 기록하고 있는 투자 상품을 확인하세요
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-md border-none p-8 mb-8">
          <p className="text-foreground leading-relaxed mb-4">
            HANBANG 플랫폼의 실시간 투자 랭킹은 투자자들에게 가장 수익성 높은 기회를 제공합니다. 
            우리의 알고리즘은 실시간으로 수익률을 계산하여 가장 성공적인 투자 상품을 순위로 매깁니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            이 랭킹은 단순히 과거 성과를 보여주는 것이 아닙니다. 현재 진행 중인 프로젝트의 실시간 성장률, 
            시장 반응, 그리고 투자자들의 관심도를 종합적으로 분석하여 매 시간 업데이트됩니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            상위 랭킹에 오른 프로젝트들은 글로벌 팬덤의 뜨거운 관심을 받고 있으며, 
            지속적인 수익 창출이 기대되는 우수한 콘텐츠입니다. 하지만 투자는 항상 리스크가 따르므로, 
            신중한 판단이 필요합니다.
          </p>
          <p className="text-foreground leading-relaxed">
            랭킹은 매일 자정에 초기화되며, 새로운 투자 기회가 상장될 때마다 실시간으로 반영됩니다. 
            투자 결정 전에 각 프로젝트의 상세 정보를 꼼꼼히 검토하시기 바랍니다.
          </p>
        </div>

        <div className="space-y-4">
          {rankings.map((item) => (
            <div
              key={item.rank}
              className="bg-card rounded-3xl shadow-md border-none p-6 flex items-center justify-between hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {item.rank}
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg mb-1">{item.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
                      {item.category}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      {item.change.startsWith('+') ? (
                        <ArrowUp size={14} className="text-green-500" />
                      ) : (
                        <ArrowDown size={14} className="text-red-500" />
                      )}
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{item.yield}</div>
                <div className="text-sm text-muted-foreground">누적 수익률</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">메인으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

