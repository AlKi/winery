/********************************************************************************
 * Copyright (c) 2017-2018 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 ********************************************************************************/

import { Action } from 'redux';
import {
    HighlightNodesAction,
    HideNodesAndRelationshipsAction,
    TopologyRendererActions,
    ModifyGroupsVisibilityAction,
    ModifyGroupsSubstitutionButtonsAction,
    SetGroupsSubstitutionsAction
} from '../actions/topologyRenderer.actions';
import {TNodeTemplate, TRelationshipTemplate} from "../../models/ttopology-template";

export interface TopologyRendererState {
    buttonsState: {
        targetLocationsButton?: boolean;
        policiesButton?: boolean;
        requirementsCapabilitiesButton?: boolean;
        deploymentArtifactsButton?: boolean;
        propertiesButton?: boolean;
        typesButton?: boolean;
        idsButton?: boolean;
        layoutButton?: boolean;
        alignHButton?: boolean;
        alignVButton?: boolean;
        importTopologyButton?: boolean;
        splitTopologyButton?: boolean;
        matchTopologyButton?: boolean;
        substituteTopologyButton?: boolean;
        refineTopologyButton?: boolean;
        groupNodesButton?: boolean;
        showViewBarButton?: boolean;
        hideHardwareButton?: boolean;
        hideSoftwareButton?: boolean;
        substituteHardwareButton?: boolean;
        substituteSoftwareButton?: boolean;
        substituteSelectionButton?: boolean;
        // has .[groupid] properties, which are boolean
        hideGroupButtonStates?: any;
        // has .[groupid] properties, which are boolean
        substituteGroupButtonStates?: any;
        substituteCablesButton?: boolean;
        substituteAdaptersAndCablesButton?: boolean;
    };
    nodesToSelect?: string[];
    nodesToHide: string[];
    relationshipsToHide: string[];
    substitutionNodes: TNodeTemplate[];
    substitutionRelationships: TRelationshipTemplate[];
}

export const INITIAL_TOPOLOGY_RENDERER_STATE: TopologyRendererState = {
    buttonsState: {
        targetLocationsButton: false,
        policiesButton: false,
        requirementsCapabilitiesButton: false,
        deploymentArtifactsButton: false,
        propertiesButton: false,
        typesButton: true,
        idsButton: true,
        layoutButton: false,
        alignHButton: false,
        alignVButton: false,
        importTopologyButton: false,
        splitTopologyButton: false,
        matchTopologyButton: false,
        substituteTopologyButton: false,
        refineTopologyButton: false,
        groupNodesButton: false,
        showViewBarButton: false,
        hideHardwareButton: false,
        hideSoftwareButton: false,
        substituteHardwareButton: false,
        substituteSoftwareButton: false,
        substituteSelectionButton: false,
        hideGroupButtonStates: {},
        substituteCablesButton: false,
        substituteAdaptersAndCablesButton: false
    },
    nodesToHide: [],
    relationshipsToHide: [],
    substitutionNodes: [],
    substitutionRelationships: []
};
/**
 * Reducer for the TopologyRenderer
 */
export const TopologyRendererReducer =
    function (lastState: TopologyRendererState = INITIAL_TOPOLOGY_RENDERER_STATE, action: Action): TopologyRendererState {
        switch (action.type) {
            case TopologyRendererActions.TOGGLE_POLICIES:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        policiesButton: !lastState.buttonsState.policiesButton
                    }
                };
            case TopologyRendererActions.TOGGLE_TARGET_LOCATIONS:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        targetLocationsButton: !lastState.buttonsState.targetLocationsButton
                    }
                };
            case TopologyRendererActions.TOGGLE_PROPERTIES:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        propertiesButton: !lastState.buttonsState.propertiesButton
                    }
                };
            case TopologyRendererActions.TOGGLE_REQUIREMENTS_CAPABILITIES:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        requirementsCapabilitiesButton: !lastState.buttonsState.requirementsCapabilitiesButton
                    }
                };
            case TopologyRendererActions.TOGGLE_DEPLOYMENT_ARTIFACTS:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        deploymentArtifactsButton: !lastState.buttonsState.deploymentArtifactsButton
                    }
                };
            case TopologyRendererActions.TOGGLE_IDS:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        idsButton: !lastState.buttonsState.idsButton
                    }
                };
            case TopologyRendererActions.TOGGLE_TYPES:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        typesButton: !lastState.buttonsState.typesButton
                    }
                };
            case TopologyRendererActions.EXECUTE_LAYOUT:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        layoutButton: !lastState.buttonsState.layoutButton
                    }
                };
            case TopologyRendererActions.EXECUTE_ALIGN_H:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        alignHButton: !lastState.buttonsState.alignHButton
                    }
                };
            case TopologyRendererActions.EXECUTE_ALIGN_V:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        alignVButton: !lastState.buttonsState.alignVButton
                    }
                };
            case TopologyRendererActions.IMPORT_TOPOLOGY:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        importTopologyButton: !lastState.buttonsState.importTopologyButton
                    }
                };
            case TopologyRendererActions.SPLIT_TOPOLOGY:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        splitTopologyButton: !lastState.buttonsState.splitTopologyButton
                    }
                };
            case TopologyRendererActions.MATCH_TOPOLOGY:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        matchTopologyButton: !lastState.buttonsState.matchTopologyButton
                    }
                };
            case TopologyRendererActions.SUBSTITUTE_TOPOLOGY:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        substituteTopologyButton: !lastState.buttonsState.substituteTopologyButton
                    }
                };
            case TopologyRendererActions.REFINE_TOPOLOGY:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        refineTopologyButton: !lastState.buttonsState.refineTopologyButton
                    }
                };
            case TopologyRendererActions.GROUP_NODES:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        groupNodesButton: !lastState.buttonsState.groupNodesButton
                    }
                };
            case TopologyRendererActions.HIGHLIGHT_NODES:
                const data = <HighlightNodesAction> action;
                if (data.nodesToHighlight) {
                    return {
                        ...lastState,
                        nodesToSelect: data.nodesToHighlight
                    };
                } else {
                    delete lastState.nodesToSelect;
                }
                break;
            case TopologyRendererActions.HIDE_NODES_AND_RELATIONSHIPS:
                const nodesAndRelationshipsData = <HideNodesAndRelationshipsAction> action;

                if (nodesAndRelationshipsData.nodesToHide && nodesAndRelationshipsData.relationshipsToHide) {
                    return {
                        ...lastState,
                        nodesToHide: nodesAndRelationshipsData.nodesToHide,
                        relationshipsToHide: nodesAndRelationshipsData.relationshipsToHide
                    };
                } else {
                    lastState.nodesToHide = [""];
                    lastState.relationshipsToHide = [""];
                }
                break;
            case TopologyRendererActions.TOGGLE_VIEW_BAR:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        showViewBarButton: !lastState.buttonsState.showViewBarButton
                    }
                };
            case TopologyRendererActions.TOGGLE_HIDE_HARDWARE:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        hideHardwareButton: !lastState.buttonsState.hideHardwareButton
                    }
                };
            case TopologyRendererActions.TOGGLE_HIDE_SOFTWARE:
                return {
                    ...lastState,
                    buttonsState: {
                        ...lastState.buttonsState,
                        hideSoftwareButton: !lastState.buttonsState.hideSoftwareButton
                    }
                };
            case TopologyRendererActions.GROUPS_VISIBILITY_MODIFIED: {
                const myAction = <ModifyGroupsVisibilityAction> action;
                const state = lastState;
                state.buttonsState.hideGroupButtonStates[myAction.buttonId] = !state.buttonsState.hideGroupButtonStates[myAction.buttonId];

                return state;
            }
            case TopologyRendererActions.GROUPS_SUBSTITUTION_BUTTONS_MODIFIED: {
                const myAction = <ModifyGroupsSubstitutionButtonsAction> action;
                const state = lastState;
                state.buttonsState.substituteGroupButtonStates[myAction.buttonId] = !state.buttonsState.substituteGroupButtonStates[myAction.buttonId];

                return state;
            }
            case TopologyRendererActions.GROUPS_SUBSTITUTIONS_MODIFIED: {
                const myAction = <SetGroupsSubstitutionsAction>action;
                const state = lastState;
                state.substitutionNodes = myAction.substitutionNodes;
                state.substitutionRelationships = myAction.substitutionRelationships;
                return state;
            }
        }
        return lastState;
    };
