import {createFileRoute} from '@tanstack/react-router';
import {catalogOptions,ratingOptions,pageHead} from '@/lib/localmart-api';
import {Home} from '@/components/localmart/home';
export const Route=createFileRoute('/')({head:()=>pageHead('Discover local. Shop nearby. Support small.','Discover products from local businesses, meet the people behind them, and support your neighbourhood with LOCALMART.'),loader:({context})=>Promise.all([context.queryClient.ensureQueryData(catalogOptions),context.queryClient.ensureQueryData(ratingOptions)]),component:Home});
