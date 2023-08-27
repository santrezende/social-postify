export class Publication {
  private _mediaId: string;
  private _postId: string;
  private _date: Date;

  constructor(title: string, username: string) {
    this._mediaId = title;
    this._postId = username;
    this._date = new Date();
  }

  get mediaId() {
    return this._mediaId;
  }

  get postId() {
    return this._postId;
  }

  get date() {
    return this._date;
  }
}
