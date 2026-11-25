import { useUserSearchContext } from '../../context/userSearchContext';
import { ErrorMessage } from '../common/StatusMessage';

export function SearchErrorMessage() {
  const { error } = useUserSearchContext();
  return error ? <ErrorMessage error={error} /> : null;
}
