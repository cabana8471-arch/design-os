import { describe, it, expect } from 'vitest'
import {
  ProductOverviewSchema,
  ProductRoadmapSchema,
  ColorTokensSchema,
  DataModelSchema,
  SectionSchema,
} from '../schemas'
import { SectionDataSchema, ParsedSpecSchema, SampleDataSchema } from '../schemas/section'

describe('ProductOverviewSchema', () => {
  it('validates a complete product overview', () => {
    const data = {
      name: 'My Product',
      description: 'A great product',
      problems: [{ title: 'Problem 1', solution: 'Solution 1' }],
      features: ['Feature 1', 'Feature 2'],
    }

    const result = ProductOverviewSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('requires a product name', () => {
    const data = {
      name: '',
      description: 'Description',
      problems: [],
      features: [],
    }

    const result = ProductOverviewSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('defaults problems and features to empty arrays', () => {
    const data = {
      name: 'Product',
      description: 'Description',
    }

    const result = ProductOverviewSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.problems).toEqual([])
      expect(result.data.features).toEqual([])
    }
  })
})

describe('ProductRoadmapSchema', () => {
  it('validates sections correctly', () => {
    const data = {
      sections: [
        { id: 'section-1', title: 'Section 1', description: 'Desc', order: 1 },
        { id: 'section-2', title: 'Section 2', description: 'Desc', order: 2 },
      ],
    }

    const result = ProductRoadmapSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('requires at least one section', () => {
    const data = { sections: [] }

    const result = ProductRoadmapSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('ColorTokensSchema', () => {
  it('accepts valid Tailwind colors', () => {
    const data = {
      primary: 'blue',
      secondary: 'lime',
      neutral: 'stone',
    }

    const result = ColorTokensSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid color names', () => {
    const data = {
      primary: 'rainbow',
      secondary: 'lime',
      neutral: 'stone',
    }

    const result = ColorTokensSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('SectionSchema', () => {
  it('requires positive order number', () => {
    const data = {
      id: 'test',
      title: 'Test',
      description: 'Desc',
      order: 0,
    }

    const result = SectionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('DataModelSchema', () => {
  it('validates entities and relationships', () => {
    const data = {
      entities: [{ name: 'User', description: 'A user entity' }],
      relationships: ['User has many Posts'],
    }

    const result = DataModelSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('defaults to empty arrays', () => {
    const data = {}

    const result = DataModelSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.entities).toEqual([])
      expect(result.data.relationships).toEqual([])
    }
  })
})

describe('ParsedSpecSchema', () => {
  it('defaults useShell to true', () => {
    const data = {
      title: 'Section',
      overview: 'Overview',
    }

    const result = ParsedSpecSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.useShell).toBe(true)
    }
  })
})

describe('SectionDataSchema', () => {
  it('validates complete section data', () => {
    const data = {
      sectionId: 'invoices',
      exists: true,
      spec: '# Spec',
      specParsed: {
        title: 'Invoices',
        overview: 'Invoice management',
        userFlows: ['Create invoice'],
        uiRequirements: ['List view'],
        useShell: true,
      },
      data: { invoices: [] },
      screenDesigns: [
        { name: 'InvoiceList', path: '/path', componentName: 'InvoiceList' },
      ],
      screenshots: [],
    }

    const result = SectionDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('SampleDataSchema', () => {
  it('validates sample data with _meta', () => {
    const data = {
      _meta: {
        models: { invoices: 'List of invoices' },
        relationships: ['Invoice has Client'],
      },
      invoices: [{ id: 1, amount: 100 }],
    }

    const result = SampleDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('allows data without _meta', () => {
    const data = {
      invoices: [{ id: 1, amount: 100 }],
    }

    const result = SampleDataSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
