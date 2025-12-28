import { describe, it, expect } from 'vitest'
import { parseProductOverview, parseProductRoadmap } from '../product-loader'

describe('parseProductOverview', () => {
  it('returns null for empty input', () => {
    expect(parseProductOverview('')).toBeNull()
    expect(parseProductOverview('   ')).toBeNull()
  })

  it('parses a complete product overview', () => {
    const md = `# My Product

## Description
A great product that does amazing things.

## Problems & Solutions

### Problem 1: Hard to manage tasks
Our product provides an intuitive task management interface.

### Problem 2: No collaboration
Built-in team collaboration features.

## Key Features
- Feature one
- Feature two
- Feature three
`

    const result = parseProductOverview(md)

    expect(result).not.toBeNull()
    expect(result?.name).toBe('My Product')
    expect(result?.description).toBe('A great product that does amazing things.')
    expect(result?.problems).toHaveLength(2)
    expect(result?.problems[0].title).toBe('Hard to manage tasks')
    expect(result?.problems[0].solution).toBe('Our product provides an intuitive task management interface.')
    expect(result?.features).toHaveLength(3)
    expect(result?.features[0]).toBe('Feature one')
  })

  it('parses overview with only description', () => {
    const md = `# Simple Product

## Description
Just a simple description.
`

    const result = parseProductOverview(md)

    expect(result).not.toBeNull()
    expect(result?.name).toBe('Simple Product')
    expect(result?.description).toBe('Just a simple description.')
    expect(result?.problems).toHaveLength(0)
    expect(result?.features).toHaveLength(0)
  })

  it('handles missing sections gracefully', () => {
    const md = `# Product

## Key Features
- Only has features
`

    const result = parseProductOverview(md)

    expect(result).not.toBeNull()
    expect(result?.name).toBe('Product')
    expect(result?.features).toHaveLength(1)
    expect(result?.description).toBe('')
  })

  it('returns null if nothing meaningful is parsed', () => {
    const md = `# Product

Some random text without proper sections.
`

    const result = parseProductOverview(md)
    expect(result).toBeNull()
  })
})

describe('parseProductRoadmap', () => {
  it('returns null for empty input', () => {
    expect(parseProductRoadmap('')).toBeNull()
    expect(parseProductRoadmap('   ')).toBeNull()
  })

  it('parses sections correctly', () => {
    const md = `# Product Roadmap

## Sections

### 1. User Management
Handle user registration and authentication.

### 2. Dashboard
Main dashboard for viewing metrics.

### 3. Reports & Analytics
Generate and export reports.
`

    const result = parseProductRoadmap(md)

    expect(result).not.toBeNull()
    expect(result?.sections).toHaveLength(3)
    expect(result?.sections[0].id).toBe('user-management')
    expect(result?.sections[0].title).toBe('User Management')
    expect(result?.sections[0].order).toBe(1)
    expect(result?.sections[2].id).toBe('reports-and-analytics')
  })

  it('sorts sections by order', () => {
    const md = `# Roadmap

### 3. Third
Third section.

### 1. First
First section.

### 2. Second
Second section.
`

    const result = parseProductRoadmap(md)

    expect(result?.sections[0].order).toBe(1)
    expect(result?.sections[1].order).toBe(2)
    expect(result?.sections[2].order).toBe(3)
  })

  it('returns null if no sections found', () => {
    const md = `# Product Roadmap

Just some text without proper section format.
`

    const result = parseProductRoadmap(md)
    expect(result).toBeNull()
  })

  it('handles ampersand in section titles', () => {
    const md = `# Roadmap

### 1. Sales & Marketing
Sales and marketing features.
`

    const result = parseProductRoadmap(md)

    expect(result?.sections[0].id).toBe('sales-and-marketing')
    expect(result?.sections[0].title).toBe('Sales & Marketing')
  })
})
