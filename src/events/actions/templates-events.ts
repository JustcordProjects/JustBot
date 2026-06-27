import actionsManager from '@/features/actions.ts';
import { EmptyObject } from '../../defs.ts';
export default actionsManager;

export type ForceReloadTemplatesEventCtx = EmptyObject;

export const OnForceReloadTemplates = actionsManager.mkEvent('OnForceReloadTemplates');
