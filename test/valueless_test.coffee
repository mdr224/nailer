Index = require '../index.js'

describe 'Requesting a CSV', ->
  context 'search options', ->
    it 'with a full date range valid', ->
      @options = Index#searchOptions('', '', '')
      expect(@options).to.eql {}

    it 'with a start date valid', ->
      @options = Index#searchOptions('Jan 1, 2010', '', '')
      console.log(@options);
      expect(@options).to.eql {created_at: {'&gte: '}}

    it 'with an end date valid', ->
      expect("").to.eql ""

    it 'with no dates valid', ->
      expect("").to.eql ""