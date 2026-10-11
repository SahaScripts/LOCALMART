import {createFileRoute} from '@tanstack/react-router';
import {pageHead,pageSearch} from '@/lib/localmart-api';
import {Checkout} from '@/components/localmart/workflows';
import {Loading} from '@/components/localmart/shared';
export const Route=createFileRoute('/checkout')({head:()=>pageHead('Checkout','Checkout on LOCALMART. Discover local. Shop nearby. Support small.'),validateSearch:pageSearch,pendingComponent:Loading,component:Checkout});
