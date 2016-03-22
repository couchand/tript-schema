var chai = require('chai')
chai.should()

var ZSchema = require('z-schema')

var schema = require('../schema')

var validate = function(type, json) {
  var validator = new ZSchema()
  if (!json) {
    return validator.validate(type, schema)
  }
  else {
    type = 'definitions.' + type
    return validator.validate(json, schema, { schemaPath: type })
  }
}

describe('tript schema', function() {
  it('is a valid schema', function() {
    var validator = new ZSchema()
    validator.validateSchema(schema).should.be.true
  })

  it('expects a top-level Function', function() {
    validate({}).should.be.false
  })

  describe('LiteralBoolean', function() {
    it('expects a type', function() {
      validate('literal-boolean', {}).should.be.false
    })

    it('expects a value', function() {
      validate('literal-boolean', {
        _type: 'LiteralBoolean'
      }).should.be.false
    })

    it('disallows additional properties', function() {
      validate('literal-boolean', {
        _type: 'LiteralBoolean',
        value: true,
        foobar: 'baz'
      }).should.be.false
    })

    it('validates booleans', function() {
      validate('literal-boolean', {
        _type: 'LiteralBoolean',
        value: true
      }).should.be.true

      validate('literal-boolean', {
        _type: 'LiteralBoolean',
        value: false
      }).should.be.true
    })
  })

  describe('And', function() {
    it('expects a type', function() {
      validate('and', {}).should.be.false
    })

    it('expects children', function() {
      validate('and', {
        _type: 'And'
      }).should.be.false
    })

    it('disallows additional properties', function() {
      validate('and', {
        _type: 'And',
        children: [],
        foobar: 'baz'
      }).should.be.false
    })

    it('validates empty children', function() {
      validate('and', {
        _type: 'And',
        children: []
      }).should.be.true
    })

    it('expects a child expression', function() {
      validate('and', {
        _type: 'And',
        children: [
          {
            foo: 'bar'
          }
        ]
      }).should.be.false
    })

    it('validates non-empty children', function() {
      validate('and', {
        _type: 'And',
        children: [
          {
            _type: 'LiteralBoolean',
            value: false
          }
        ]
      }).should.be.true
    })
  })

  describe('Or', function() {
    it('expects a type', function() {
      validate('or', {}).should.be.false
    })

    it('expects children', function() {
      validate('or', {
        _type: 'Or'
      }).should.be.false
    })

    it('disallows additional properties', function() {
      validate('or', {
        _type: 'Or',
        children: [],
        foobar: 'baz'
      }).should.be.false
    })

    it('validates empty children', function() {
      validate('or', {
        _type: 'Or',
        children: []
      }).should.be.true
    })

    it('expects a child expression', function() {
      validate('or', {
        _type: 'Or',
        children: [
          {
            foo: 'bar'
          }
        ]
      }).should.be.false
    })

    it('validates non-empty children', function() {
      validate('or', {
        _type: 'Or',
        children: [
          {
            _type: 'LiteralBoolean',
            value: false
          }
        ]
      }).should.be.true
    })
  })

  describe('identifier', function() {
    it('expects name to be non-empty', function() {
      validate('identifier', '').should.be.false
    })

    it('expects name to be non-whitespace', function() {
      validate('identifier', '  ').should.be.false
      validate('identifier', '\t').should.be.false
      validate('identifier', '\n').should.be.false
      validate('identifier', '\r').should.be.false
    })

    it('expects name to start with a letter', function() {
      validate('identifier', '42').should.be.false
    })

    it('allows valid names', function() {
      validate('identifier', 'a').should.be.true
      validate('identifier', 'A').should.be.true
      validate('identifier', 'aA').should.be.true
      validate('identifier', 'a2').should.be.true
    })
  })

  describe('type', function() {
    it('expects a valid type', function() {
      validate('type', 'foo').should.be.false
      validate('type', 'bool').should.be.false
      validate('type', 'number').should.be.false
    })

    it('validates types', function() {
      validate('type', 'Boolean').should.be.true
    }) 
  })

  describe('Function', function() {
    it('expects a type', function() {
      validate({
        name: 'Foobar',
        parameters: [],
        body: {
          _type: 'LiteralBoolean',
          value: true
        }
      }).should.be.false
    })

    it('expects a name', function() {
      validate({
        _type: 'Function',
        parameters: [],
        body: {
          _type: 'LiteralBoolean',
          value: true
        }
      }).should.be.false
    })

    it('expects a body', function() {
      validate({
        _type: 'Function',
        name: 'Foobar',
        parameters: []
      }).should.be.false
    })

    it('expects parameters', function() {
      validate({
        _type: 'Function',
        name: 'Test',
        body: {
          _type: 'LiteralBoolean',
          value: true
        }
      }).should.be.false
    })

    describe('parameters', function() {
      it('expects a name', function() {
        validate('parameter', {
          type: 'Boolean'
        }).should.be.false
      })

      it('expects a type', function() {
        validate('parameter', {
          name: 'foobar'
        }).should.be.false
      })

      it('validates parameters', function() {
        validate('parameter', {
          name: 'foobar',
          type: 'Boolean'
        }).should.be.true
      })

      it('disallows other properties', function() {
        validate('parameter', {
          name: 'foobar',
          type: 'Boolean',
          foobar: 'baz'
        }).should.be.false
      })
    })

    it('disallows other properties', function() {
      validate({
        _type: 'Function',
        name: 'Test',
        body: {
          _type: 'LiteralBoolean',
          value: true
        },
        parameters: [],
        foobar: 'Baz'
      }).should.be.false
    })
  })

  describe('Reference', function() {
    it('expects a type', function() {
      validate('reference', {
        name: 'foobar'
      }).should.be.false
    })

    it('expects a name', function() {
      validate('reference', {
        _type: 'Reference'
      }).should.be.false
    })

    it('disallows additional properties', function() {
      validate('reference', {
        _type: 'Reference',
        name: 'foobar',
        foobar: 'baz'
      }).should.be.false
    })

    it('validates', function() {
      validate('reference', {
        _type: 'Reference',
        name: 'foobar'
      }).should.be.true
    })
  })

  it('validates a valid schema', function() {
    validate({
      _type: 'Function',
      name: 'Test',
      parameters: [
        {
          name: 'foobar',
          type: 'Boolean'
        }
      ],
      body: {
        _type: 'And',
        children: [
          {
            _type: 'Or',
            children: [
              {
                _type: 'LiteralBoolean',
                value: true
              },
              {
                _type: 'Reference',
                name: 'foobar'
              }
            ]
          }
        ]
      }
    }).should.be.true
  })
})
