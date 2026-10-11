import {createFileRoute} from '@tanstack/react-router';
import {pageHead} from '@/lib/localmart-api';
import {Info} from '@/components/localmart/workflows';
export const Route=createFileRoute('/about')({head:()=>pageHead('About LOCALMART','About LOCALMART, your local small-business marketplace.'),component:()=> <Info kind="about"/>});
