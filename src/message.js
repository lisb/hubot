'use strict'

class Message {
  // Represents an incoming message from the chat.
  //
  // user - A User instance that sent the message.
  constructor (user, done) {
    this.user = user
    this.done = done || false
    this.room = this.user.room
    this.rooms = this.user.rooms

    const r = (this.rooms && this.rooms[this.room]) || {}
    this.roomType = r.type
    this.roomTopic = r.topic
    this.roomUsers = r.users
  }

  // Indicates that no other Listener should be called on this object
  //
  // Returns nothing.
  finish () {
    this.done = true
  }
}

class TextMessage extends Message {
  // Represents an incoming message from the chat.
  //
  // user - A User instance that sent the message.
  // text - A String message.
  // id   - A String of the message ID.
  // mention - A mention data of the message. (optional)
  constructor (user, text, id, mention) {
    super(user)
    this.text = text
    this.id = id
    if (mention) {
      this.mentionAll = mention.all || false
      this.mentionMe = mention.me || false
      this.mentions = mention.data || []
    }
  }

  // Determines if the message matches the given regex.
  //
  // regex - A Regex to check.
  //
  // Returns a Match object or null.
  match (regex) {
    return this.text.match(regex)
  }

  // String representation of a TextMessage
  //
  // Returns the message text
  toString () {
    return this.text
  }
}

// Represents an incoming user entrance notification.
//
// user - A User instance for the user who entered.
// text - Always null.
// id   - A String of the message ID.
class EnterMessage extends Message {}

// Represents an incoming user exit notification.
//
// user - A User instance for the user who left.
// text - Always null.
// id   - A String of the message ID.
class LeaveMessage extends Message {}

// Represents an incoming myself entrance notification.
//
// user - A User instance for myself.
// text - Always null.
// id   - Always null.
class JoinMessage extends Message {}

// Represents an incoming topic change notification.
//
// user - A User instance for the user who changed the topic.
// text - A String of the new topic
// id   - A String of the message ID.
class TopicMessage extends TextMessage {}

class CatchAllMessage extends Message {
  // Represents a message that no matchers matched.
  //
  // message - The original message.
  constructor (message) {
    super(message.user)
    this.message = message
  }
}

module.exports = {
  Message,
  TextMessage,
  EnterMessage,
  LeaveMessage,
  JoinMessage,
  TopicMessage,
  CatchAllMessage
}
