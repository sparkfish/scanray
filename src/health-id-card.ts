import { DateTime } from 'luxon'

interface Dictionary<T> {
  [Key: string]: T
}

export default class HealthIdCard {
  private _data: string
  private _cardParts: string[] = []
  private _nameParts: string[] = []
  private _cardType: string = 'INVALID'

  constructor(data: string) {
    // high-level parsing into card parts
    this._data = data.trim()
    if (this._data.slice(-1) == '?') this._data = this._data.substring(0, this._data.length - 1)
    this._cardParts = []
    this._data.split('^').forEach((val, index) => {
      this._cardParts[index] = val
    })
    if (this._cardParts.length > 0 && this._cardParts[0].length >= 2) {
      if (this._cardParts[0][0] == '%') {
        this._cardType = this._cardParts[0].slice(1, 3)
      }
    }

    // extract name parts: `<Surname>/<Given Name>/<Middle Name>/<Suffix>`
    // example: "JOHN Q PUBLIC JR" => "PUBLIC/JOHN/Q/JR"
    this._nameParts = ['', '', '', '']
    const _nameData = this._cardParts.length > 1 ? this._cardParts[1] : ''
    _nameData.split('/').forEach((val, index) => {
      this._nameParts[index] = val
    })
  }

  public clone() {
    return JSON.parse(JSON.stringify(this));
  }

  public toJson() {
    // dump core properties that have values
    const card: Dictionary<any> = {}
    const objectToInspect = Object.getPrototypeOf(this)
    const props = Object.getOwnPropertyNames(objectToInspect) as (keyof HealthIdCard)[]
    props.forEach((property) => {
      if (this[property]) card[property] = this[property]
    })
    return JSON.stringify(card)
  }

  private getSegmentValue(segmentId: string, defaultValue: string | undefined = ''): string {
    const segIdLen = segmentId.length
    const segment = this._cardParts.find((s) => s.length > segIdLen && s.slice(0, segIdLen) == segmentId) || ''
    return segment.length > segIdLen ? segment.slice(segIdLen) : defaultValue
  }

  public getSegmentDate(segmentId: string): string {
    const date = DateTime.fromISO(this.getSegmentValue(segmentId))
    return date.isValid ? date.toISODate() : ''
  }

  public get firstName(): string {
    return this._nameParts[1]
  }

  public get lastName(): string {
    return this._nameParts[0]
  }

  public get middleName(): string {
    return this._nameParts[2]
  }

  public get suffix(): string {
    return this._nameParts[3]
  }

  public get birthDate(): string {
    return this.getSegmentDate('DB')
  }

  public get streetLine1(): string {
    return this.getSegmentValue('A1')
  }

  public get streetLine2(): string {
    return this.getSegmentValue('A2')
  }

  public get city(): string {
    return this.getSegmentValue('CY')
  }

  public get state(): string {
    return this.getSegmentValue('ST')
  }

  public get zip(): string {
    return this.getSegmentValue('ZP')
  }

  public get cardType(): string {
    return this._cardType
  }

  public get issuerId(): string {
    if (this._cardType != 'INVALID' && this._cardParts[0].length > 3) {
      return this._cardParts[0].slice(3, Math.min(13, this._cardParts[0].length))
    }
    return ''
  }

  public get cardholderId(): string {
    if (this._cardType != 'INVALID' && this._cardParts[0].length > 13) {
      return this._cardParts[0].slice(13)
    }
    return ''
  }

  public get drugCardholderId(): string {
    return this.getSegmentValue('RI')
  }

  public get groupNumber(): string {
    return this.getSegmentValue('GR')
  }

  public get issueDate(): string {
    return this.getSegmentDate('DI')
  }

  public get rxBin(): string {
    return this.getSegmentValue('BN')
  }

  public get rxPcn(): string {
    return this.getSegmentValue('PC')
  }

  public get primaryPhysicianNpi(): string {
    return this.getSegmentValue('PP')
  }

  public get primaryPhysicianName(): string {
    return this.getSegmentValue('PN')
  }
}
