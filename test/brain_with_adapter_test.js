'use strict'

/* global describe, beforeEach, afterEach, it */
/* eslint-disable no-unused-expressions */

// Assertions and Stubbing
const chai = require('chai')
const sinon = require('sinon')
chai.use(require('sinon-chai'))

const expect = chai.expect

// Hubot classes
const Brain = require('../src/brain')
const User = require('../src/user')

describe('Brain with direct adapter', function () {
  beforeEach(function () {
    this.clock = sinon.useFakeTimers()
    this.mockAdapter = {
      users () { return {} },
      talks () { return {} },
      domains () { return {} }
    }
    this.mockRobot = {
      emit () { },
      on () { },
      adapter: this.mockAdapter
    }

    // This *should* be callsArgAsync to match the 'on' API, but that makes
    // the tests more complicated and seems irrelevant.
    sinon.stub(this.mockRobot, 'on').withArgs('running').callsArg(1)

    this.brain = new Brain(this.mockRobot)

    this.user1 = this.brain.userForId('1', { name: 'Guy One' })
    this.user2 = this.brain.userForId('2', { name: 'Guy One Two' })
    this.user3 = this.brain.userForId('3', { name: 'Girl Three' })
    this.users = [this.user1, this.user2, this.user3].reduce((acc, u) => ({ ...acc, [u.id]: u }), {})

    this.domainId = '1234567890123456'
  })

  afterEach(function () {
    this.clock.restore()
  })

  describe('Unit Tests', function () {
    describe('#users', function () {
      it('calls "adapter.users" only once with no arguments', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.users()

        expect(spy).to.have.been.calledWith(undefined)
        expect(spy.calledOnce).to.be.ok
      })

      it('calls "adapter.users" only once with domainId', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.users(this.domainId)

        expect(spy).to.have.been.calledWith(this.domainId)
        expect(spy.calledOnce).to.be.ok
      })
    })

    describe('#userForId', function () {
      it('calls "adapter.users" only once with no argument', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.userForId(1)

        expect(spy).to.have.been.calledWith(undefined)
        expect(spy.calledOnce).to.be.ok
      })

      it('calls "adapter.users" only once with domainId', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.userForId(1, this.domainId)

        expect(spy).to.have.been.calledWith(this.domainId)
        expect(spy.calledOnce).to.be.ok
      })

      it('does not store new user object', function () {
        const user = this.brain.userForId('4', { name: 'Guy Four' })
        expect(user.id).to.equal('4')
        expect(user.name).to.equal('Guy Four')

        const got = this.brain.userForId('4', this.domainId)
        expect(got).to.not.equal(user)
        expect(got.name).to.equal('4')
      })

      it('returns new user object if calls with no domainId', function () {
        const stub = sinon.stub(this.mockAdapter, 'users')
        stub.returns({})
        stub.withArgs(this.domainId).returns(this.users)

        const result = this.brain.userForId(1)

        expect(result).to.not.equal(this.user1)
      })

      it('returns stored user object if calls with domainId', function () {
        const stub = sinon.stub(this.mockAdapter, 'users')
        stub.returns({})
        stub.withArgs(this.domainId).returns(this.users)

        const result = this.brain.userForId(1, this.domainId)

        expect(result).to.equal(this.user1)
      })

      describe('when there is no matching user ID', function () {
        it('creates a new User but does not store it in "brain.data.users"', function () {
          expect(this.brain.data.users).to.not.include.key('all-new-user')
          const newUser = this.brain.userForId('all-new-user')
          expect(newUser).to.be.instanceof(User)
          expect(newUser.id).to.equal('all-new-user')
          expect(this.brain.data.users).to.not.include.key('all-new-user')
        })
      })
    })

    describe('#userForName', function () {
      it('calls "adapter.users" only once with no argument', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.userForName('Guy One')

        expect(spy).to.have.been.calledWith(undefined)
        expect(spy.calledOnce).to.be.ok
      })

      it('calls "adapter.users" only once with domainId', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.userForName('Guy One', this.domainId)

        expect(spy).to.have.been.calledWith(this.domainId)
        expect(spy.calledOnce).to.be.ok
      })

      describe('when the adapter returns users', function () {
        beforeEach(function () {
          const stub = this.stub = sinon.stub(this.mockAdapter, 'users')
          stub.returns({})
          stub.withArgs(this.domainId).returns(this.users)
        })

        afterEach(function () {
          this.stub = null
        })

        it('returns the user with a matching name', function () {
          expect(this.brain.userForName('Guy One')).to.be.null
          expect(this.brain.userForName('Guy One', this.domainId)).to.equal(this.user1)
        })

        it('does a case-insensitive match', function () {
          expect(this.brain.userForName('guy one', this.domainId)).to.equal(this.user1)
        })

        it('returns null if no user matches', function () {
          expect(this.brain.userForName('not a real user', this.domainId)).to.be.null
        })
      })
    })

    describe('#usersForRawFuzzyName', function () {
      it('calls "adapter.users" only once with no argument', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.usersForRawFuzzyName('Guy One')

        expect(spy).to.have.been.calledWith(undefined)
        expect(spy.calledOnce).to.be.ok
      })

      it('calls "adapter.users" only once with domainId', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.usersForRawFuzzyName('Guy One', this.domainId)

        expect(spy).to.have.been.calledWith(this.domainId)
        expect(spy.calledOnce).to.be.ok
      })

      describe('when the adapter returns users', function () {
        beforeEach(function () {
          const stub = this.stub = sinon.stub(this.mockAdapter, 'users')
          stub.returns({})
          stub.withArgs(this.domainId).returns(this.users)
        })

        afterEach(function () {
          this.stub = null
        })

        it('does a case-insensitive match', function () {
          expect(this.brain.usersForRawFuzzyName('guy')).to.be.an('array').and.empty
          expect(this.brain.usersForRawFuzzyName('guy', this.domainId)).to.have.members([this.user1, this.user2])
        })

        it('returns all matching users (prefix match) when there is not an exact match (case-insensitive)', function () {
          expect(this.brain.usersForRawFuzzyName('Guy', this.domainId)).to.have.members([this.user1, this.user2])
        })

        it('returns all matching users (prefix match) when there is an exact match (case-insensitive)', function () {
          // Matched case
          expect(this.brain.usersForRawFuzzyName('Guy One', this.domainId)).to.deep.equal([this.user1, this.user2])
          // Mismatched case
          expect(this.brain.usersForRawFuzzyName('guy one', this.domainId)).to.deep.equal([this.user1, this.user2])
        })

        it('returns an empty array if no users match', function () {
          const result = this.brain.usersForRawFuzzyName('not a real user', this.domainId)
          expect(result).to.be.an('array')
          expect(result).to.be.empty
        })
      })
    })

    describe('#usersForFuzzyName', function () {
      it('calls "adapter.users" only once with no argument', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.usersForFuzzyName('Guy One')

        expect(spy).to.have.been.calledWith(undefined)
        expect(spy.calledOnce).to.be.ok
      })

      it('calls "adapter.users" only once with domainId', function () {
        const spy = sinon.spy(this.mockAdapter, 'users')

        this.brain.usersForFuzzyName('Guy One', this.domainId)

        expect(spy).to.have.been.calledWith(this.domainId)
        expect(spy.calledOnce).to.be.ok
      })

      describe('when the adapter returns users', function () {
        beforeEach(function () {
          const stub = this.stub = sinon.stub(this.mockAdapter, 'users')
          stub.returns({})
          stub.withArgs(this.domainId).returns(this.users)
        })

        afterEach(function () {
          this.stub = null
        })

        it('does a case-insensitive match', function () {
          expect(this.brain.usersForFuzzyName('guy')).to.be.an('array').and.empty
          expect(this.brain.usersForFuzzyName('guy', this.domainId)).to.have.members([this.user1, this.user2])
        })

        it('returns all matching users (prefix match) when there is not an exact match', function () {
          expect(this.brain.usersForFuzzyName('Guy', this.domainId)).to.have.members([this.user1, this.user2])
        })

        it('returns just the user when there is an exact match (case-insensitive)', function () {
          // Matched case
          expect(this.brain.usersForFuzzyName('Guy One', this.domainId)).to.deep.equal([this.user1])
          // Mismatched case
          expect(this.brain.usersForFuzzyName('guy one', this.domainId)).to.deep.equal([this.user1])
        })

        it('returns an empty array if no users match', function () {
          const result = this.brain.usersForFuzzyName('not a real user', this.domainId)
          expect(result).to.be.an('array')
          expect(result).to.be.empty
        })
      })
    })

    describe('#rooms', function () {
      it('calls "adapter.talks" only once', function () {
        const spy = sinon.spy(this.mockAdapter, 'talks')
        this.brain.rooms()
        expect(spy).to.have.been.calledOnce
      })

      it('returns the empty value if mock robot', function () {
        expect(this.brain.rooms()).to.deep.equal({})
      })
    })

    describe('#domains', function () {
      it('calls "adapter.domains" only once', function () {
        const spy = sinon.spy(this.mockAdapter, 'domains')
        this.brain.domains()
        expect(spy).to.have.been.calledOnce
      })

      it('returns the empty value if mock robot', function () {
        expect(this.brain.domains()).to.deep.equal({})
      })
    })
  })
})
