import { DateTime } from 'luxon'

interface Dictionary<T> {
  [Key: string]: T
}

export default class AamvaIdCard {
  private _data: string
  private _cardParts: string[] = []
  private _cardType: string = 'INVALID'
  private _version: number | undefined = undefined
  private _issuerId: string | undefined = undefined

  constructor(data: string, segDelim: string = '\x0A', recDelim: string = '\x0A', segTerm = '\x0D') {
    // high-level parsing into card parts and details from header
    this._data = data.trim()
    const minValidLength = 100 // semi-arbitrary minimum length
    const ansiPos = 1 + segDelim.length + recDelim.length + segTerm.length
    if (
      this._data.length > minValidLength &&
      this._data[0] == '@' &&
      this._data.slice(ansiPos, ansiPos + 5) === 'ANSI ' // note: trailing space is part of spec
    ) {
      const headerInfo = this.getSlice(this._data, ansiPos)
      this._issuerId = this.getSlice(headerInfo, 5, 11)
      this._version = Number.parseInt(this.getSlice(headerInfo, 11, 13)) || 0
      this._cardType = 'AAMVA-' + this.getSlice(headerInfo, 17, 19) || 'INVALID'

      // split out segmented data elements from first "subfile" ('DL' or 'ID')
      const subfileOffset = Number.parseInt(this.getSlice(headerInfo, 19, 23)) || 0
      const subfileLen = Number.parseInt(this.getSlice(headerInfo, 23, 27)) || 0
      this._cardParts = this.getSlice(headerInfo, subfileOffset, subfileOffset + subfileLen)?.split(segDelim) || []
    }
  }

  public clone() {
    return JSON.parse(JSON.stringify(this))
  }

  public toJson() {
    // dump core properties that have values
    const card: Dictionary<any> = {}
    const objectToInspect = Object.getPrototypeOf(this)
    const props = Object.getOwnPropertyNames(objectToInspect) as (keyof AamvaIdCard)[]
    props.forEach((property) => {
      if (this[property]) card[property] = this[property]
    })
    return JSON.stringify(card)
  }

  private getSlice(
    segment: string,
    start: number,
    end: number | undefined = undefined,
    defaultValue: string | undefined = ''
  ): string {
    const segLen = segment?.length || 0
    if (segLen > start) return (end && segLen > end ? segment.slice(start, end) : segment.slice(start)).trim()
    return defaultValue
  }

  private getSegmentValue(segmentId: string, defaultValue: string | undefined = ''): string {
    const segIdLen = segmentId.length
    const segment = this._cardParts.find((s) => s.length > segIdLen && s.slice(0, segIdLen) == segmentId) || ''
    return segment.length > segIdLen ? segment.slice(segIdLen).trim() : defaultValue
  }

  public getSegmentDate(segmentId: string): string {
    // expected formats: MMDDCCYY (USA) or CCYYMMDD (CAN)
    const dateString = this.getSegmentValue(segmentId)
    if (dateString.length != 8) return ''
    let date = DateTime.invalid('default')
    if (['18', '19', '20'].includes(dateString.slice(4, 6))) date = DateTime.fromFormat(dateString, 'MMddyyyy')
    if (['18', '19', '20'].includes(dateString.slice(0, 2))) date = DateTime.fromFormat(dateString, 'yyyyMMdd')
    return date.isValid ? date.toISODate() : ''
  }

  public get firstName(): string {
    const wasTruncted = this.getSegmentValue('DDF', 'N') === 'Y'
    return (
      (this.getSegmentValue('DAC', undefined) ||
        this.getSegmentValue('DCT', undefined) ||
        this.getSegmentValue('DBP', undefined) ||
        '') + (wasTruncted ? ']' : '')
    )
  }

  public get middleName(): string {
    const wasTruncted = this.getSegmentValue('DDG', 'N') === 'Y'
    return (this.getSegmentValue('DBQ', undefined) || this.getSegmentValue('DAD', undefined) || '') + (wasTruncted ? ']' : '')
  }

  public get lastName(): string {
    const wasTruncted = this.getSegmentValue('DDE', 'N') === 'Y'
    return (
      (this.getSegmentValue('DCS', undefined) ||
        this.getSegmentValue('DAB', undefined) ||
        this.getSegmentValue('DBO', undefined) ||
        this.getSegmentValue('DBN', undefined) ||
        '') + (wasTruncted ? ']' : '')
    )
  }

  public get prefix(): string {
    return this.getSegmentValue('DAF', undefined) || ''
  }

  public get suffix(): string {
    const wasTruncted = this.getSegmentValue('DDG', 'N') === 'Y'
    return (
      (this.getSegmentValue('DAE', undefined) ||
        this.getSegmentValue('DBR', undefined) ||
        this.getSegmentValue('DCU', undefined) ||
        this.getSegmentValue('DBS', undefined) ||
        '') + (wasTruncted ? ']' : '')
    )
  }

  public get fullName(): string {
    return this.getSegmentValue('DAA', undefined) || ''
  }

  public get birthDate(): string {
    return this.getSegmentDate('DBB') || this.getSegmentDate('DBL') || ''
  }

  public get sex(): string {
    switch (this.getSegmentValue('DBC', undefined) || '') {
      case '1':
        return 'M'
      case '2':
        return 'F'
      default:
        return ''
    }
  }

  public get issuerId(): string {
    return this._issuerId || ''
  }

  public get cardType(): string {
    return this._cardType
  }

  public get version(): number {
    return this._version || 0
  }

  /*
    TODO: decode race / ethnicity

  Codes for race or ethnicity of the cardholder, as defined in ANSI D20.

Possible values and interpretations:

    Race
        AI = Alaskan or American Indian (Having Origins in Any of The Original Peoples of North America, and Maintaining Cultural Identification Through Tribal Affiliation of Community Recognition)
        AP = Asian or Pacific Islander (Having Origins in Any of the Original Peoples of the Far East, Southeast Asia, or Pacific Islands. This Includes China, India, Japan, Korea, the Philippines Islands, and Samoa)
        BK = Black (Having Origins in Any of the Black Racial Groups of Africa)
        W = White (Having Origins in Any of The Original Peoples of Europe, North Africa, or the Middle East)
    Ethnicity
        H = Hispanic Origin (A Person of Mexican, Puerto Rican, Cuban, Central or South American or Other Spanish Culture or Origin, Regardless of Race)
        O = Not of Hispanic Origin (Any Person Other Than Hispanic)
        U = Unknown
   */

  public get race(): string {
    return this.getSegmentValue('DCL', undefined) || ''
  }

  public get ethnicity(): string {
    return this.getSegmentValue('DCL', undefined) || ''
  }

  public get eyeColor(): string {
    /*
      BLK = Black
BLU = Blue
BRO = Brown
GRY = Gray
GRN = Green
HAZ = Hazel
MAR = Maroon
PNK = Pink
DIC = Dichromatic
UNK = Unknown
       */
    return this.getSegmentValue('DAY', undefined) || ''
  }

  public get hairColor(): string {
    /*
      BAL = Bald
BLK = Black
BLN = Blond
BRO = Brown
GRY = Grey
RED = Red/Auburn
SDY = Sandy
WHI = White
UNK = Unknown
      */
    return this.getSegmentValue('DAZ', undefined) || ''
  }

  public get weight(): string {
    const lb = this.getSegmentValue('DAW', undefined) || ''
    if (lb) return `${lb} lb`

    const kg = this.getSegmentValue('DAX', undefined) || ''
    if (kg) return `${kg} kg`

    return ''
  }

  public get height(): string {
    return this.getSegmentValue('DAU', undefined) || ''
  }

  // TODO: research whether these are valid alternates -- not sure where they came from!
  // 'DAL': 'Residence Street Address1',
  // 'DAM': 'Residence Street Address2',
  // 'DAN': 'Residence City',
  // 'DAO': 'Residence Jurisdiction Code',
  // 'DAP': 'Residence Postal Code',

  public get streetAddress1(): string {
    return this.getSegmentValue('DAG', undefined) || ''
  }

  public get streetAddress2(): string {
    return this.getSegmentValue('DAH', undefined) || ''
  }

  public get city(): string {
    return this.getSegmentValue('DAI', undefined) || ''
  }

  public get state(): string {
    return this.getSegmentValue('DAJ', undefined) || ''
  }

  public get zip(): string {
    const zip = this.getSegmentValue('DAK', undefined) || ''
    if (zip.length > 5 && zip.slice(5) == '0000') return zip.slice(0, 5)
    return zip
  }

  public get country(): string {
    return this.getSegmentValue('DCG', undefined) || ''
  }

  public get birthPlace(): string {
    return this.getSegmentValue('DCI', undefined) || ''
  }

  public get isDonor(): boolean {
    return (this.getSegmentValue('DDK', undefined) || '') == '1'
  }

  public get isVeteran(): boolean {
    return (this.getSegmentValue('DDL', undefined) || '') == '1'
  }

  public get cardholderId(): string {
    return this.getSegmentValue('DAQ', undefined) || ''
  }

  public get ssn(): string {
    return this.getSegmentValue('DBK', undefined) || this.getSegmentValue('DBM', undefined) || ''
  }
}
