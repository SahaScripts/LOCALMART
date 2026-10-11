import {createFileRoute} from '@tanstack/react-router';
import {pageHead,pageSearch} from '@/lib/localmart-api';
import {Orders} from '@/components/localmart/workflows';
import {Loading} from '@/components/localmart/shared';
export const Route=createFileRoute('/orders')({head:()=>pageHead('My orders','My orders on LOCALMART. Discover local. Shop nearby. Support small.'),validateSearch:pageSearch,pendingComponent:Loading,component:Orders});
