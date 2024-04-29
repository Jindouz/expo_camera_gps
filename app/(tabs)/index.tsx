import { useRootNavigationState, Redirect } from 'expo-router';


export default function InitalRouting() {
  console.log('InitalRouting');
  
  const rootNavigationState = useRootNavigationState();

  console.log(rootNavigationState);

  if (!rootNavigationState?.key) return null;


  return <Redirect href={'/one'} />
}
