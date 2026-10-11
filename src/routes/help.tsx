import {createFileRoute} from '@tanstack/react-router';
import {pageHead} from '@/lib/localmart-api';
import {Info} from '@/components/localmart/workflows';
export const Route=createFileRoute('/help')({head:()=>pageHead('Help LOCALMART','Help LOCALMART, your local small-business marketplace.'),component:()=> <Info kind="help"/>});
