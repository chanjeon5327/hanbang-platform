"use client"

import { useState, useEffect } from "react"
import { useConnect, useAccount, useDisconnect } from "wagmi"
import { Loader2 } from "lucide-react"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [mounted, setMounted] = useState(false)
  const { connect, connectors, isPending, error } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isConnected && address && onConnect) {
      onConnect(address)
    }
  }, [isConnected, address, onConnect])

  useEffect(() => {
    if (!isConnected && onDisconnect) {
      onDisconnect()
    }
  }, [isConnected, onDisconnect])

  if (!mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent-color)' }} />
      </div>
    )
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = () => {
    // injected({ target: 'metaMask' })로 설정했으므로 첫 번째 connector가 메타마스크
    const metaMaskConnector = connectors.find((connector) => 
      connector.id === "io.metamask" || 
      connector.name === "MetaMask" ||
      connector.id === "injected"
    )
    
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
    } else if (connectors.length > 0) {
      // 첫 번째 사용 가능한 connector 사용 (설정에서 injected가 첫 번째)
      connect({ connector: connectors[0] })
    } else {
      console.error("No connectors available")
    }
  }

  if (isConnected && address) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <div style={{ 
          padding: '12px 20px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>연결된 지갑</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {formatAddress(address)}
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          연결 해제
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        onClick={handleConnect}
        disabled={isPending}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: 'var(--accent-color)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          opacity: isPending ? 0.6 : 1,
          transition: 'all 0.2s'
        }}
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            연결 중...
          </>
        ) : (
          <>
            <span>🦊</span>
            메타마스크로 시작하기
          </>
        )}
      </button>
      {error && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          <p style={{ 
            color: 'var(--up-color)', 
            fontSize: '13px', 
            textAlign: 'center',
            fontWeight: 'bold',
            margin: 0
          }}>
            {error.message?.includes('Provider not found') || error.message?.includes('No provider') 
              ? "지갑이 감지되지 않습니다. 확장 프로그램을 설치해주세요."
              : error.message || "지갑 연결에 실패했습니다. MetaMask가 설치되어 있는지 확인해주세요."}
          </p>
          {(error.message?.includes('Provider not found') || error.message?.includes('No provider') || !error.message) && (
            <button
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              <span>🦊</span>
              메타마스크 설치하러 가기
            </button>
          )}
        </div>
      )}
    </div>
  )
}

