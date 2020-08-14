// Copyright (c) 2017 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import {
  Robot,
  OnSend,
  WithReadStatusProperties, WithOnReadStatusHandler,
  YesNo, SentYesNo,
  Text, SentText,
  TaskClosingType,
  ResponseWithJson, RemoteFile, RemoteFiles, Note, SentNote,
} from "../types";

exports = (robot: Robot) => {
  robot.send({room: "id"}, "トークを指定して送信");

  robot.respond(/send/i, res => {
    res.send("テキスト");
    res.send({text: "テキスト"});
    res.send({stamp_set: "3", stamp_index: "1152921507291203198"});
    res.send({stamp_set: "3", stamp_index: "1152921507291203198", text: "テキスト付き"});
    res.send({question: "Yes No 質問"});
    res.send({close_yesno: "yesno message id"});
    res.send({question: "Select 質問", options: ["A", "B", "C"]});
    res.send({close_select: "select message id"});
    res.send({title: "タスク", closing_type: TaskClosingType.Any});
    res.send({close_task: "task message id"});
    res.send({path: "/path/to/file", name: "添付ファイル", type: "text/plain", text: "先ほどの議事録です"});
    res.send({path: ["/path/to/image1", "/path/to/image2"], type: ["image/png", "image/png"]});
    res.send({note_title: "title", note_content: "content"});
    res.send({note_title: "title", note_content: "consent", note_attachments: [{path: "/path/to/local-file"}]});
    res.topic(`test`);
  });

  robot.respond(/text (.*)/i, res => {
    res.send(`echo ${res.match[1]}`);

    const c1: Text & WithReadStatusProperties<SentText> = {
      text: "返答",
      onread: () => true,
      onsend: (sent) => {
        console.log(sent.message.content.text);
        console.log(sent.readUsers);
        console.log(sent.unreadUsers);
      }
    };
    res.send(c1);

    const c2: Text & WithOnReadStatusHandler<SentText> = {
      text: "返答",
      onread: (nows, reads, unreads) => {
        console.log(nows);
      },
      onsend: (sent) => {
        console.log(sent.message.content.text);
      }
    };
    res.send(c2);
  });

  robot.respond("stamp", res => {
    res.send(`${res.json.stamp_set} - ${res.json.stamp_index}`);
  });
  robot.respond("yesno", res => {
    if (res.json.response) {
      res.json.response;
    } else {
      res.json.question;
    }
    res.send({in_reply_to: res.message.id, response: true});
  });
  robot.respond("select", res => {
    if (res.json.response) {
      res.json.options[res.json.response];
    } else {
      res.json.question;
      res.json.options;
    }
    res.send({in_reply_to: res.message.id, response: 0});
  });
  robot.respond("task", res => {
    if (res.json.done) {
      res.json.done;
    } else {
      res.json.title;
      res.json.closing_type;
    }
    res.send({in_reply_to: res.message.id, done: true});
  });

  const onFile = (res: ResponseWithJson<RemoteFile | RemoteFiles>, file: RemoteFile): void => {
    file.name;
    file.content_type;
    file.content_size;
    res.download(file, path => {
      console.log(`downloaded to ${path}`);
    });
  };
  robot.respond("file", res => {
    onFile(res, res.json);
  });
  robot.respond("files", res => {
    res.json.files.forEach(f => onFile(res, f));
  })

  robot.respond("map", res => {
    res.json.place;
    res.json.lat;
    res.json.lng;
  });

  robot.respond(/create note$/i, res => {
    const c: Note & OnSend<SentNote> = {
      note_title: "タイトル",
      note_content: "本文",
      onsend: sent => {
        sent.note.id;
      }
    };
    res.send(c);
  });
  robot.respond("note_created", res => {
    res.json.note_id;
    res.json.title;
    res.json.revision;
    res.json.has_attachments;
  });
  robot.respond("note_updated", res => {
    res.json.note_id;
    res.json.title;
    res.json.revision;
    res.json.has_attachments;
  });
  robot.respond("note_deleted", res => {
    res.json.note_id;
    res.json.title;
  });

  robot.respond(/yesno answers/i, res => {
    const cs: YesNo & OnSend<SentYesNo> = {
      question: "質問",
      onsend: (sent) => {
        sent.message.content.question;
        sent.message.content.listing;
        sent.answer((trues, falses) => {
          console.log(trues);
        });
      }
    };
    res.send(cs);
  });

  robot.respond(/yesno read properties/i, res => {
    const cs: YesNo & WithReadStatusProperties<SentYesNo> = {
      question: "質問",
      onread: () => true,
      onsend: (sent) => {
        sent.readUsers;
        sent.unreadUsers;
        sent.answer((trues, falses) => {
          console.log(trues);
        });
      }
    };
    res.send(cs);
  });

  robot.respond(/yesno read handler/i, res => {
    const cs: YesNo & WithOnReadStatusHandler<SentYesNo> = {
      question: "質問",
      onread: (nows, reads, unreads) => {
        console.log(nows);
      },
      onsend: (sent) => {
        sent.answer((trues, falses) => {
          console.log(trues);
        });
      }
    };
    res.send(cs);
  });

  robot.respond(/goodbye/i, res => {
    res.leave();
  });
  robot.respond(/banned word/, res => {
    res.leave(res.message.user);
  });

  robot.respond(/announce (.*)/, res => {
    res.announce(res.match[1]);
  });

  robot.roomTopic({room:`12345`}, "test");
}
