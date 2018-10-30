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

import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { NgRedux } from '@angular-redux/store';
import { TopologyRendererActions } from '../redux/actions/topologyRenderer.actions';
import { IWineryState } from '../redux/store/winery.store';
import { BackendService } from '../services/backend.service';
import { Subscription } from 'rxjs';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { TopologyRendererState } from '../redux/reducers/topologyRenderer.reducer';
import { WineryActions } from '../redux/actions/winery.actions';
import { TTopologyTemplate, TNodeTemplate } from '../models/ttopology-template';
import { EntityTypesModel } from '../models/entityTypesModel';
import { isNullOrUndefined } from 'util';

/**
 * The navbar of the topologymodeler.
 */
@Component({
    selector: 'winery-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    animations: [
        trigger('navbarInOut', [
            transition('void => *', [
                style({transform: 'translateY(-100%)'}),
                animate('200ms ease-out')
            ]),
            transition('* => void', [
                animate('200ms ease-in', style({transform: 'translateY(-100%)'}))
            ])
        ])
    ]
})
export class NavbarComponent implements OnDestroy {

    @Input() hideNavBarState: boolean;
    @Input() readonly: boolean;
    @Input() entityTypes: EntityTypesModel;

    @ViewChild('exportCsarButton')
    private exportCsarButtonRef: ElementRef;

    navbarButtonsState: TopologyRendererState;
    unformattedTopologyTemplate;
    subscriptions: Array<Subscription> = [];
    exportCsarUrl: string;
    splittingOngoing: boolean;
    matchingOngoing: boolean;

    constructor(private alert: ToastrService,
                private ngRedux: NgRedux<IWineryState>,
                private actions: TopologyRendererActions,
                private wineryActions: WineryActions,
                private backendService: BackendService,
                private hotkeysService: HotkeysService) {
        this.subscriptions.push(ngRedux.select(state => state.topologyRendererState)
            .subscribe(newButtonsState => this.setButtonsState(newButtonsState)));
        this.subscriptions.push(ngRedux.select(currentState => currentState.wineryState.currentJsonTopology)
            .subscribe(topologyTemplate => this.unformattedTopologyTemplate = topologyTemplate));
        this.hotkeysService.add(new Hotkey('mod+s', (event: KeyboardEvent): boolean => {
            event.stopPropagation();
            this.saveTopologyTemplateToRepository();
            return false; // Prevent bubbling
        }, undefined, 'Save the Topology Template'));
        this.hotkeysService.add(new Hotkey('mod+l', (event: KeyboardEvent): boolean => {
            event.stopPropagation();
            this.ngRedux.dispatch(this.actions.executeLayout());
            return false; // Prevent bubbling
        }, undefined, 'Apply the layout directive to the Node Templates'));
        this.exportCsarUrl = this.backendService.serviceTemplateURL + '/?csar';
    }

    /**
     * Setter for buttonstate
     * @param newButtonsState
     */
    setButtonsState(newButtonsState: TopologyRendererState): void {
        this.navbarButtonsState = newButtonsState;
        if (!this.navbarButtonsState.buttonsState.splitTopologyButton) {
            this.splittingOngoing = false;
        }
        if (!this.navbarButtonsState.buttonsState.matchTopologyButton) {
            this.matchingOngoing = false;
        }
    }

    /**
     * Getter for the style of a pressed button.
     * @param buttonPressed
     */
    getStyle(buttonPressed: boolean): string {
        if (buttonPressed) {
            return '#AAEEAA';
        }
    }

    /**
     * Exports the service template as a CSAR file
     * @param event
     */
    exportCsar(event) {
        let url = this.exportCsarUrl;
        if (event.ctrlKey) {
            url = url.replace(/csar$/, 'definitions');
            console.log(url);
        }
        window.open(url);
    }

    /**
     * This function is called whenever a navbar button is clicked.
     * It contains a separate case for each button.
     * It toggles the `pressed` state of a button and publishes the respective
     * button id and boolean to the subscribers of the Observable inside
     * SharedNodeNavbarService.
     * @param event -- The click event of a button.
     */
    toggleButton(event) {
        switch (event.target.id) {
            case 'targetLocations': {
                this.ngRedux.dispatch(this.actions.toggleTargetLocations());
                break;
            }
            case 'policies': {
                this.ngRedux.dispatch(this.actions.togglePolicies());
                break;
            }
            case 'requirementsCapabilities': {
                this.ngRedux.dispatch(this.actions.toggleRequirementsCapabilities());
                break;
            }
            case 'deploymentArtifacts': {
                this.ngRedux.dispatch(this.actions.toggleDeploymentArtifacts());
                break;
            }
            case 'properties': {
                this.ngRedux.dispatch(this.actions.toggleProperties());
                break;
            }
            case 'types': {
                this.ngRedux.dispatch(this.actions.toggleTypes());
                break;
            }
            case 'ids': {
                this.ngRedux.dispatch(this.actions.toggleIds());
                break;
            }
            case 'layout': {
                this.ngRedux.dispatch(this.actions.executeLayout());
                break;
            }
            case 'alignh': {
                this.ngRedux.dispatch(this.actions.executeAlignH());
                break;
            }
            case 'alignv': {
                this.ngRedux.dispatch(this.actions.executeAlignV());
                break;
            }
            case 'importTopology': {
                this.ngRedux.dispatch(this.actions.importTopology());
                break;
            }
            case 'split': {
                this.ngRedux.dispatch(this.actions.splitTopology());
                this.splittingOngoing = true;
                break;
            }
            case 'match': {
                this.ngRedux.dispatch(this.actions.matchTopology());
                this.matchingOngoing = true;
                break;
            }
            case 'substituteTopology': {
                this.ngRedux.dispatch(this.actions.substituteTopology());
                break;
            }
            case 'refineTopology': {
                this.readonly = true;
                this.ngRedux.dispatch(this.wineryActions.sendPaletteOpened(false));
                this.ngRedux.dispatch(this.actions.refineTopology());
                break;
            }
            case 'showViewBar': {
                this.ngRedux.dispatch(this.actions.toggleViewBar());
                break;
            }
            case 'hideHardware': {
                this.ngRedux.dispatch(this.actions.toggleHideHardware());
                this.clickHideUnhideNodes();
                break;
            }
            case 'hideSoftware': {
                this.ngRedux.dispatch(this.actions.toggleHideSoftware());
                this.clickHideUnhideNodes();
                break;
            }
            case 'hideNoncomputing': {
                this.ngRedux.dispatch(this.actions.toggleHideNoncomputing());
                break;
            }
            case 'substituteHardware': {
                this.ngRedux.dispatch(this.actions.toggleSubstituteHardware());
                break;
            }
            case 'substituteSoftware': {
                this.ngRedux.dispatch(this.actions.toggleSubstituteSoftware());
                break;
            }
            case 'substituteSelection': {
                this.ngRedux.dispatch(this.actions.toggleSubstituteSelection());
                break;
            }
        }
    }

    /**
     * Calls the BackendService's saveTopologyTemplate method and displays a success message if successful.
     */
    saveTopologyTemplateToRepository() {
        // Initialization
        const topologySkeleton = {
            documentation: [],
            any: [],
            otherAttributes: {},
            relationshipTemplates: [],
            nodeTemplates: []
        };
        // Prepare for saving by updating the existing topology with the current topology state inside the Redux store
        topologySkeleton.nodeTemplates = this.unformattedTopologyTemplate.nodeTemplates;
        topologySkeleton.relationshipTemplates = this.unformattedTopologyTemplate.relationshipTemplates;
        topologySkeleton.relationshipTemplates.map(relationship => {
            delete relationship.state;
        });
        // remove the 'Color' field from all nodeTemplates as the REST Api does not recognize it.
        topologySkeleton.nodeTemplates.map(nodeTemplate => {
            delete nodeTemplate.visuals;
            delete nodeTemplate.state;
        });
        const topologyToBeSaved = topologySkeleton;
        console.log(topologyToBeSaved);
        // The topology gets saved here.
        this.backendService.saveTopologyTemplate(topologyToBeSaved)
            .subscribe(res => {
                res.ok === true ? this.alert.success('<p>Saved the topology!<br>' + 'Response Status: '
                    + res.statusText + ' ' + res.status + '</p>')
                    : this.alert.info('<p>Something went wrong! <br>' + 'Response Status: '
                    + res.statusText + ' ' + res.status + '</p>');
            }, err => this.alert.error(err.error));
    }

    /**
     * Angular lifecycle event.
     */
    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    openManagementUi() {
        window.open(this.backendService.serviceTemplateUiUrl, '_blank');
    }

    /**
     * hides or un-hides all nodes which are oft the given node type or children of it, according to the activated buttons
     */
    clickHideUnhideNodes(){
        //this.alert.info(typeof this.unformattedTopologyTemplate.nodeTemplates);
        var nodeIdsToHide: string[] = [];
        // iterate over all node components
        for( var nodeIndex=0; nodeIndex<this.unformattedTopologyTemplate.nodeTemplates.length; nodeIndex++ ){
            if(this.navbarButtonsState.buttonsState.hideHardwareButton){
                if(this.checkIfNodeTypeDerivedOf(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].type, '{http://www.example.org/tosca/nodetypes}Hardware-Node_0.0.1-w1-wip1')){
                    // add this node to the list of nodes to be set invisible
                    nodeIdsToHide.push(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id);
                }
            }
            if(this.navbarButtonsState.buttonsState.hideSoftwareButton){
                if(!this.checkIfNodeTypeDerivedOf(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].type, '{http://www.example.org/tosca/nodetypes}Hardware-Node_0.0.1-w1-wip1')){
                    // add this node to the list of nodes to be set invisible
                    nodeIdsToHide.push(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id);
                }
            }
        }
        this.alert.info("Hiding " + nodeIdsToHide.length + " Nodes");
        //console.log("unformattedTopologyTemplate: " +JSON.stringify(this.unformattedTopologyTemplate));
        var relationshipIdsToHide = this.checkRelationshipsToHide(nodeIdsToHide);
        console.log("hiding nodes: " + JSON.stringify(nodeIdsToHide));
        console.log("hiding relationships: " + JSON.stringify(relationshipIdsToHide));
        this.ngRedux.dispatch(this.actions.hideNodesAndRelationships(nodeIdsToHide, relationshipIdsToHide));
    }

    /**
     *
     * @param nodeTypeName qName of a nodeType to be checked if it is a child nodeType of the second parameter 'parentNodeTypeName'
     * @param parentNodeTypeName qName of a nodeType to be checked if it is a parent nodeType of the first parameter 'nodeTypeName'
     * @returns {boolean} true if parentNodeTypeName is any parent node type qName of the given nodeTypeName qname
     */
    private checkIfNodeTypeDerivedOf(nodeTypeName: string, parentNodeTypeName): boolean{
        // add this nodes type
        var parentNodeTypeNames: string[] = new Array(nodeTypeName);
        var parentNodeTypeFound: boolean = false;
        var currentParentNodeTypeName: string = nodeTypeName;
        //console.log(JSON.stringify(this.entityTypes.unGroupedNodeTypes));

        do {
            parentNodeTypeFound = false;
            // iterate all node type namespaces
            searchParent:
                // iterate all node types of this namespace
                for(let nodeTypeIndex=0; nodeTypeIndex<this.entityTypes.unGroupedNodeTypes.length; nodeTypeIndex ++){
                    // if this node type is the last found (parent) node type, check if there is a "derivedFrom" attribute to get the parent node type
                    if(currentParentNodeTypeName == this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].qName){
                        //console.log("found node Type " + this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].qName);
                        for(let implementationIndex=0; implementationIndex<this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation.length; implementationIndex++){
                            // if the attribute "derivedFrom" is defined
                            if(!isNullOrUndefined(this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation[implementationIndex].derivedFrom)){
                                // add this parent node type
                                if(this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation[implementationIndex].derivedFrom.typeRef == parentNodeTypeName){
                                    // we found the parent node type, so the given nodeType is derived from it
                                    return true;
                                }
                                // found parent node, but not the given one
                                parentNodeTypeFound = true;
                                //
                                currentParentNodeTypeName = this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation[implementationIndex].derivedFrom.typeRef;
                                break searchParent;
                            }
                        }

                    }
                }

        }while(parentNodeTypeFound);

        // parent node type not found in parent nodes of given node type
        return false;
    }

    /**
     * checks all relationships for hidden sources/targets
     */
    checkRelationshipsToHide(nodesToHide: string[]): string[]{
        var relsToHide: string[] = [];
        // iterate all nrelationshipTemplates and check, if a target or source is to be hidden. If so, add the relationship to the hidden ones as well
        for(let relTempIndex=0; relTempIndex<this.unformattedTopologyTemplate.relationshipTemplates.length; relTempIndex++){
            checkThisRelationship:
            for(let hiddenNodeTypeIndex=0; hiddenNodeTypeIndex<nodesToHide.length; hiddenNodeTypeIndex++){
                if((this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].sourceElement.ref === nodesToHide[hiddenNodeTypeIndex])
                        || (this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].targetElement.ref === nodesToHide[hiddenNodeTypeIndex])){
                    relsToHide.push(this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].id);
                    break checkThisRelationship;
                }
            }
        }
        return relsToHide;
    }

    /**
     *
     * @param nodeTypeName qname of the
     * @returns string[] containing the nodes nodeType name and all parent nodeType names
     */
    /*private getParentNodeTypeNames(nodeTypeName: string): string[]{
     // add this nodes type
     var parentNodeTypeNames: string[] = new Array(nodeTypeName);
     var parentNodeTypeFound: boolean = false;
     var currentParentNodeTypeName: string = nodeTypeName;
     do {
     parentNodeTypeFound = false;
     // iterate all node type namespaces
     searchParent:
     // iterate all node types of this namespace
     for( var nodeTypeIndex=0; nodeTypeIndex<this.entityTypes.unGroupedNodeTypes.length; nodeTypeIndex ++){
     // if this node type is the last found (parent) node type, check if there is a "derivedFrom" attribute to get the parent node type
     if(currentParentNodeTypeName == this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].qName){
     for(var implementationIndex=0; implementationIndex<this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation.length; implementationIndex++){
     // if the attribute "derivedFrom" is defined
     if(!isNullOrUndefined(this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation[implementationIndex].derivedFrom)){
     // add this parent node type
     parentNodeTypeNames.push(this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation[implementationIndex].derivedFrom.typeRef);
     parentNodeTypeFound = true;
     currentParentNodeTypeName = this.entityTypes.unGroupedNodeTypes[nodeTypeIndex].full.serviceTemplateOrNodeTypeOrNodeTypeImplementation[implementationIndex].derivedFrom.typeRef;
     break searchParent;
     }
     }

     }
     }

     }while(parentNodeTypeFound);

     return parentNodeTypeNames;
     }*/
}
