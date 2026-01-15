"use client";

import { useState } from "react";
import { Clock, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClosingSoonPage() {
  const closingProjects = [
    { id: 1, name: "웹툰 <황녀의 귀환>", hours: 2, progress: "98%", category: "웹툰" },
    { id: 2, name: "K-POP <Midnight> 앨범", hours: 5, progress: "95%", category: "K-POP" },
    { id: 3, name: "드라마 <서울 로맨스>", hours: 12, progress: "92%", category: "드라마" },
    { id: 4, name: "유튜브 <Tech Review>", hours: 18, progress: "88%", category: "유튜브" },
    { id: 5, name: "영화 <도시의 별>", hours: 24, progress: "85%", category: "영화" },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '128px', paddingBottom: '120px' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <Clock className="mx-auto mb-4" size={48} color="var(--accent-color)" />
          <h1 className="text-4xl font-bold text-foreground mb-4">마감 임박 프로젝트</h1>
          <p className="text-muted-foreground text-lg">
            곧 마감되는 투자 기회, 놓치지 마세요
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-md border-none p-8 mb-8">
          <p className="text-foreground leading-relaxed mb-4">
            마감 임박 프로젝트는 곧 투자 모집이 종료되는 프로젝트들입니다. 
            높은 모집률은 투자자들의 뜨거운 관심을 보여주며, 성공 가능성이 높은 프로젝트임을 시사합니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            마감이 임박할수록 남은 투자 기회는 줄어듭니다. 관심 있는 프로젝트가 있다면 
            서둘러 투자 결정을 내리는 것이 좋습니다. 마감 후에는 추가 투자가 불가능하며, 
            다음 기회를 기다려야 합니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            하지만 마지막 순간의 성급한 결정은 피해야 합니다. 충분한 검토 없이 투자하면 
            예상치 못한 리스크에 노출될 수 있습니다. 프로젝트의 상세 정보와 투자 조건을 
            꼼꼼히 확인한 후 결정하시기 바랍니다.
          </p>
          <p className="text-foreground leading-relaxed mb-4">
            마감 임박 프로젝트는 실시간으로 업데이트되며, 모집률이 100%에 도달하면 즉시 
            투자 모집이 종료됩니다. 투자 진행 중에 마감될 수 있으니, 가능한 한 여유 있게 
            투자 결정을 내리시기 바랍니다.
          </p>
          <p className="text-foreground leading-relaxed">
            마감된 프로젝트는 투자 모집 단계를 마치고 실제 콘텐츠 제작 및 배포 단계로 
            진행됩니다. 투자자들은 프로젝트 성과에 따라 배당을 받게 되며, 성공적인 프로젝트의 
            경우 상당한 수익을 기대할 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          {closingProjects.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-3xl shadow-md border-none p-6 hover:shadow-lg transition-all border-l-4 border-primary"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-lg mb-1">{item.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
                        {item.category}
                      </span>
                      <span className="text-sm text-red-500 flex items-center gap-1 font-semibold">
                        <Clock size={14} />
                        {item.hours}시간 후 마감
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{item.progress}</div>
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

