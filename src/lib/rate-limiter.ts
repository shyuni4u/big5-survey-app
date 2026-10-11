import { NextRequest } from 'next/server'

interface RateLimiterStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimiterStore = {}
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 10, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private getClientId(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'
    
    return clientIp
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, data] of Object.entries(this.store)) {
      if (data.resetTime < now) {
        delete this.store[key]
      }
    }
  }

  public isAllowed(request: NextRequest): { allowed: boolean; resetTime?: number; remaining?: number } {
    const clientId = this.getClientId(request)
    const now = Date.now()
    
    if (!this.store[clientId] || this.store[clientId].resetTime < now) {
      this.store[clientId] = {
        count: 1,
        resetTime: now + this.windowMs
      }
      return { 
        allowed: true, 
        resetTime: this.store[clientId].resetTime,
        remaining: this.maxRequests - 1
      }
    }

    this.store[clientId].count++
    
    const remaining = Math.max(0, this.maxRequests - this.store[clientId].count)
    
    if (this.store[clientId].count > this.maxRequests) {
      return { 
        allowed: false, 
        resetTime: this.store[clientId].resetTime,
        remaining: 0
      }
    }

    return { 
      allowed: true, 
      resetTime: this.store[clientId].resetTime,
      remaining
    }
  }
}

// Survey results endpoint: 10 requests per minute per IP
export const surveyRateLimiter = new RateLimiter(10, 60 * 1000)