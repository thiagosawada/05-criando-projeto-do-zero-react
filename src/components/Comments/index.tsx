import { useUtterances } from '../../hooks/useUtterances';

const commentNodeId = 'comments';

export function Comments(): JSX.Element {
  useUtterances(commentNodeId);
  return <div id={commentNodeId} />;
}
