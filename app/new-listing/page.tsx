"use client";

import { useState } from "react";
import { Sparkles, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewListingPage() {
  const newListings = [
    { id: 1, name: "신인 걸그룹 <Luna> 데뷔", days: 1, target: "80%", category: "K-POP" },
    { id: 2, name: "웹툰 <마법사의 귀환>", days: 3, target: "65%", category: "웹툰" },
    { id: 3, name: "드라마 <서울의 밤>", days: 5, target: "45%", category: "드라마" },
    { id: 4, name: "유튜브 <요리왕> 채널", days: 7, target: "30%", category: "유튜브" },
    { id: 5, name: "영화 <도시의 별>", days: 10, target: "25%", category: "영화" },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '128px', paddingBottom: '120px' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <Sparkles className="mx-auto mb-4" size={48} color="var(--accent-color)" />
          <h1 className="text-4xl font-bold text-foreground mb-4">신규 상장 프로젝트</h1>
          <p className="text-muted-foreground text-lg">
            방금 상장된 새로운 투자 기회를 가장 먼저 만나보세요
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-md border-none p-8 mb-8">
          <p className="text-foreground leading-relaxed mb-4">
            HANBANG 플랫폼은 매일 새로운 콘텐츠 투자 기회를 선보입니다. 신규 상장 프로젝트는 
            창작자들이 직접 출품한 검증된 콘텐츠로, 투자자들에게 최초의 수익 기회를 제공합니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            신규 상장 프로젝트는 엄격한 심사 과정을 거쳐 선정됩니다. 우리의 전문가 팀은 
            각 프로젝트의 시장 잠재력, 창작자의 역량, 그리고 수익 가능성을 종합적으로 평가합니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            초기 투자자들은 특별한 혜택을 받을 수 있습니다. 조기 투자 시 더 유리한 가격으로 
            지분을 확보할 수 있으며, 프로젝트 성공 시 우선 배당 혜택도 제공됩니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            하지만 신규 프로젝트는 아직 시장 검증이 완료되지 않았을 수 있습니다. 
            투자 전에 프로젝트 상세 정보, 창작자 이력, 그리고 시장 분석 자료를 충분히 검토하시기 바랍니다.
          </p>
          <p className="text-foreground leading-relaxed">
            신규 상장 프로젝트는 매일 오전 9시에 업데이트되며, 한정된 수량으로만 모집됩니다. 
            관심 있는 프로젝트가 있다면 빠른 결정이 필요할 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          {newListings.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-3xl shadow-md border-none p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-lg mb-1">{item.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
                        {item.category}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock size={14} />
                        {item.days}일 전 상장
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{item.target}</div>
                  <div className="text-sm text-muted-foreground">모집률</div>
                </div>
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

