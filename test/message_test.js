'use strict'

/* global describe, beforeEach, it */
/* eslint-disable no-unused-expressions */

// Assertions and Stubbing
const chai = require('chai')
chai.use(require('sinon-chai'))

const expect = chai.expect

// Hubot classes
const User = require('../src/user')
const Message = require('../src/message').Message
const TextMessage = require('../src/message').TextMessage

describe('Message', function () {
  beforeEach(function () {
    this.user = new User({
      id: 1,
      name: 'hubottester',
      room: '#mocha'
    })
  })

  describe('Unit Tests', function () {
    describe('#finish', () =>
      it('marks the message as done', function () {
        const testMessage = new Message(this.user)
        expect(testMessage.done).to.not.be.ok
        testMessage.finish()
        expect(testMessage.done).to.be.ok
      })
    )

    describe('TextMessage', function () {
      describe('#match', () =>
        it('should perform standard regex matching', function () {
          const testMessage = new TextMessage(this.user, 'message123')
          expect(testMessage.match(/^message123$/)).to.be.ok
          expect(testMessage.match(/^does-not-match$/)).to.not.be.ok
        })
      )

      describe('#mention*', () =>
        it('sets mention attributes passed in', function () {
          const mention = { all: false, me: true, data: [{ user: { id: 2 } }] }
          const testMessage = new TextMessage(this.user, 'message123', 'mid-1', mention)
          expect(testMessage.mentionAll).to.not.be.ok
          expect(testMessage.mentionMe).to.be.ok
          expect(testMessage.mentions).to.be.deep.equal([{ user: { id: 2 } }])
        })
      )
    })
  })
})
