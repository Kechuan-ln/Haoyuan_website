import type { Timestamp } from 'firebase/firestore'

export type BidStatus = 'draft' | 'published' | 'bidding' | 'closed' | 'evaluating' | 'awarded'

export type SubmissionStatus = 'submitted' | 'under_review' | 'qualified' | 'awarded' | 'not_awarded'

export interface BidDocument {
  name: string
  url: string
  uploadedAt: Timestamp
}

export interface Bid {
  id: string
  title: string
  bidNumber: string
  description: string
  category: string
  requirements: string
  budget: number
  status: BidStatus
  biddingDeadline: Timestamp
  openingAt: Timestamp
  documents: BidDocument[]
  reviewerIds: string[]
  awardedVendorId?: string
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface SubmissionDocument {
  name: string
  url: string
  sha256Hash: string
  uploadedAt: Timestamp
}

export interface BidSubmission {
  id: string
  bidId: string
  vendorId: string
  vendorCompanyName: string
  documents: SubmissionDocument[]
  status: SubmissionStatus
  isLocked: boolean
  submittedAt: Timestamp
  createdAt: Timestamp
}

export interface EvaluationScores {
  technical: number
  commercial: number
  qualification: number
  overall: number
}

export interface Evaluation {
  id: string
  bidId: string
  submissionId: string
  reviewerId: string
  reviewerName: string
  scores: EvaluationScores
  comments: string
  recommendation: string
  evaluatedAt: Timestamp
}
