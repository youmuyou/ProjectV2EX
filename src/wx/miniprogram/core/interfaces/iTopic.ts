
interface ITopic{
  id: number;
  title: string;
  replies: number;
  created: string;
  node: INode;
  member: IMember;
  content_rendered: string;
}