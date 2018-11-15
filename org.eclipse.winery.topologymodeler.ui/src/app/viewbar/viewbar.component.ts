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
import {animate, group, style, transition, trigger} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { NgRedux } from '@angular-redux/store';
import { TopologyRendererActions } from '../redux/actions/topologyRenderer.actions';
import { IWineryState } from '../redux/store/winery.store';
import { BackendService } from '../services/backend.service';
import { Subscription } from 'rxjs';
import { HotkeysService } from 'angular2-hotkeys';
import { TopologyRendererState} from '../redux/reducers/topologyRenderer.reducer';
import { WineryActions } from '../redux/actions/winery.actions';
import { EntityTypesModel } from '../models/entityTypesModel';
import { isNullOrUndefined } from 'util';
import {TGroupModel} from "../models/groupModel";
import {TNodeTemplate, TRelationshipTemplate, Visuals} from "../models/ttopology-template";

/**
 * The viewbar of the topologymodeler.
 */
@Component({
    selector: 'winery-viewbar',
    templateUrl: './viewbar.component.html',
    styleUrls: ['./viewbar.component.css'],
    animations: [
        trigger('viewbarInOut', [
            transition('void => *', [
                style({transform: 'translateY(-300%)'}),
                animate('200ms ease-out')
            ]),
            transition('* => void', [
                animate('200ms ease-in', style({transform: 'translateY(-300%)'}))
            ])
        ])
    ]
})
export class ViewbarComponent implements OnDestroy {

    @Input() hideNavBarState: boolean;
    @Input() readonly: boolean;
    @Input() entityTypes: EntityTypesModel;

    @ViewChild('exportCsarButton')
    private exportCsarButtonRef: ElementRef;

    viewbarButtonsState: TopologyRendererState;
    unformattedTopologyTemplate;
    subscriptions: Array<Subscription> = [];
    splittingOngoing: boolean;
    matchingOngoing: boolean;
    groups: TGroupModel[];
    nodeIdsToHide: string[] = [];
    relationshipIdsToHide: string[] = [];
    substitutionNodes: TNodeTemplate[] = [];
    substitutionRelationships: TRelationshipTemplate[] = [];
    // hiding nodes AND substituting groups in parallel
    // does not work well.
    // so at any given point in time,
    // do only one of thime!
    visualModificationMode: VisualModificationMode = VisualModificationMode.NONE;

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
        this.subscriptions.push(ngRedux.select(currentState => currentState.wineryState.groups.groups)
            .subscribe(groups => this.updateGroups(groups)));
    }

    /**
     * Setter for buttonstate
     * @param newButtonsState
     */
    setButtonsState(newButtonsState: TopologyRendererState): void {
        this.viewbarButtonsState = newButtonsState;
        if (!this.viewbarButtonsState.buttonsState.splitTopologyButton) {
            this.splittingOngoing = false;
        }
        if (!this.viewbarButtonsState.buttonsState.matchTopologyButton) {
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
     * This function is called whenever a viewbar button is clicked.
     * It contains a separate case for each button.
     * It toggles the `pressed` state of a button and publishes the respective
     * button id and boolean to the subscribers of the Observable inside
     * SharedNodeNavbarService.
     * @param event -- The click event of a button.
     */
    toggleButton(event) {
        switch (event.target.id) {
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
                console.log(JSON.stringify(this.groups));
                break;
            }
            default:{
                // most probably a "hide group" or "substitute group" button from dropdown, if so...
                if(event.target.id.startsWith("hideGroup")){
                    // check if there are nodes of groups substituted, if needed de-substitute them first
                    if(this.visualModificationMode != VisualModificationMode.HIDENODES){
                        this.visualModificationMode = VisualModificationMode.HIDENODES;
                        // TODO: de-substitute nodes of groups
                        // TODO: reset those button states to false
                    }
                    // ...remove the "hideGroup" prefix to get the group id
                    let groupId: string = event.target.id.replace("hideGroup", "");
                    // hide or show the groups nodes according to the button's toggle state
                    // beware: global state gets changed afterwards, so we need to work with the previous, not yet toggled button state
                    if(this.viewbarButtonsState.buttonsState.hideGroupButtonStates[groupId] == false){
                        console.log("hiding nodes of group " + groupId);
                        this.hideGroupById(groupId);
                    }else{
                        console.log("un-hiding nodes of group " + groupId);
                        this.showGroupById(groupId);
                    }
                    this.ngRedux.dispatch(this.actions.modifyGroupsVisibilityButtonState(groupId));
                }else if(event.target.id.startsWith("substituteGroup")){
                    // check if there are nodes of groups hidden, if needed de-substitute them first
                    if(this.visualModificationMode != VisualModificationMode.SUBSTITUTENODES){
                        this.visualModificationMode = VisualModificationMode.SUBSTITUTENODES;
                        // TODO: un-hide nodes of groups
                        // TODO: reset those button states to false
                    }
                    // ...remove the "substituteGroup" prefix to get the group id
                    let groupId: string = event.target.id.replace("substituteGroup", "");
                    // hide or show the groups nodes according to the button's toggle state
                    // beware: global state gets changed afterwards, so we need to work with the previous, not yet toggled button state
                    if(this.viewbarButtonsState.buttonsState.substituteGroupButtonStates[groupId] == false){
                        console.log("substituting nodes of group " + groupId);
                        this.substituteGroupById(groupId);
                    }else{
                        console.log("de-substituting group " + groupId);
                        this.deSubstituteGroupById(groupId);
                    }
                    this.ngRedux.dispatch(this.actions.modifyGroupsSubstitutionButtonState(groupId));
                }
            }
        }
    }


    /**
     * Angular lifecycle event.
     */
    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }


    /**
     * hides nodes of group with given id
     * @param groupName
     */
    hideGroupById(groupId: string){
        console.log(JSON.stringify(this.groups));
        for(let groupIndex=0; groupIndex<this.groups.length; groupIndex++){
            if(this.groups[groupIndex].id === groupId){
                this.hideGroup(this.groups[groupIndex]);
                return;
            }
        }
    }

    /**
     * hides all nodes of a given group
     * @param group
     */
    hideGroup(group: TGroupModel){
        // iterate over all node components
        for( let nodeIndex=0; nodeIndex<this.unformattedTopologyTemplate.nodeTemplates.length; nodeIndex++ ){
            for(let groupNodeIndex = 0; groupNodeIndex<group.nodeTemplateIds.length; groupNodeIndex++){
                if(group.nodeTemplateIds[groupNodeIndex] === this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id) {
                    // add this node to the list of nodes to be set invisible, if it is not already on the list
                    let nodeNotHidden: boolean = true;
                    for (let nodeId in this.nodeIdsToHide) {
                        if (nodeId == this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id) {
                            nodeNotHidden = false;
                            break;
                        }
                    }
                    if (nodeNotHidden) {
                    this.nodeIdsToHide.push(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id);
                    }
                }
            }
        }
        this.alert.info("Hiding " + this.nodeIdsToHide.length + " Nodes");
        //console.log("unformattedTopologyTemplate: " +JSON.stringify(this.unformattedTopologyTemplate));
        this.checkRelationshipsToHide();
        console.log("hiding nodes: " + JSON.stringify(this.nodeIdsToHide));
        console.log("hiding relationships: " + JSON.stringify(this.relationshipIdsToHide));
        this.ngRedux.dispatch(this.actions.hideNodesAndRelationships(this.nodeIdsToHide, this.relationshipIdsToHide));
    }

    /**
     * hides nodes of group with given id
     * @param groupName
     */
    showGroupById(groupId: string){
        console.log(JSON.stringify(this.groups));
        for(let groupIndex=0; groupIndex<this.groups.length; groupIndex++){
            if(this.groups[groupIndex].id === groupId){
                this.showGroup(this.groups[groupIndex]);
                return;
            }
        }
    }

    /**
     * hides all nodes of a given group
     * @param group
     */
    showGroup(group: TGroupModel){
        let nodeIdsToShow: string[] = [];
        // iterate over all node components
        for( let nodeIndex=0; nodeIndex<this.unformattedTopologyTemplate.nodeTemplates.length; nodeIndex++ ){
            for(let groupNodeIndex = 0; groupNodeIndex<group.nodeTemplateIds.length; groupNodeIndex++){
                if(group.nodeTemplateIds[groupNodeIndex] === this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id){
                    // add this node to the list of nodes to be set invisible
                    nodeIdsToShow.push(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id);
                }
            }
        }
        this.alert.info("Showing " + nodeIdsToShow.length + " Nodes more");

        // remove these nodes from the nodes to hide, if they are on it
        for (let nodeId = 0; nodeId < this.nodeIdsToHide.length; nodeId++) {
            for(let nodeIndex = 0; nodeIndex < nodeIdsToShow.length; nodeIndex++){
                if (this.nodeIdsToHide[nodeId] == nodeIdsToShow[nodeIndex]) {
                    // remove this id by removing the element at its position
                    this.nodeIdsToHide.splice(nodeId, 1);
                    // we removed one component, so go on at the same index
                    nodeId--;
                    break;
                }

            }
        }

        this.checkRelationshipsToHide();
        console.log("hiding nodes: " + JSON.stringify(this.nodeIdsToHide));
        console.log("hiding relationships: " + JSON.stringify(this.relationshipIdsToHide));
        this.ngRedux.dispatch(this.actions.hideNodesAndRelationships(this.nodeIdsToHide, this.relationshipIdsToHide));
    }

    /**
     * substitutes all nodes of a group by a new group node by
     * a) hiding all nodes of the group
     * b) hiding all relationships that go to or from one of these nodes
     * c) adding a substitution node representing the group
     * d) adding substitution relationships to or from the substitution node
     * @param substituteGroupId
     */
    substituteGroupById(substituteGroupId: string){

        let group: TGroupModel;

        // find this group by its ID
        for(let groupIndex=0; groupIndex<this.groups.length; groupIndex++){
            if(this.groups[groupIndex].id === substituteGroupId){
                group = this.groups[groupIndex];
                break;
            }
        }
        if(group == undefined){
            this.alert.error("couldn't find group for substitution. Group ID: " + substituteGroupId);
            return;
        }

        // used for determining the position of the substitution node
        let nodeXValue = 0;
        let nodeYValue = 0;
        let hiddenNodesCount = 0;

        // find all relationships emerging from or going to nodes of this group to create substitutions from/to the
        // substitution node
        // therefor iterate over all node components and find any which have to be hidden
        for( let nodeIndex=0; nodeIndex<this.unformattedTopologyTemplate.nodeTemplates.length; nodeIndex++ ){
            for(let groupNodeIndex = 0; groupNodeIndex<group.nodeTemplateIds.length; groupNodeIndex++){
                if(group.nodeTemplateIds[groupNodeIndex] === this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id) {
                    nodeXValue = nodeXValue + this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].x;
                    nodeYValue = nodeYValue + this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].y;
                    hiddenNodesCount++;
                    // add this node to the list of nodes to be set invisible, if it is not already on the list
                    let nodeNotHidden: boolean = true;
                    for (let nodeId in this.nodeIdsToHide) {
                        if (nodeId == this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id) {
                            nodeNotHidden = false;
                            break;
                        }
                    }
                    // if not already on the list, add it
                    if (nodeNotHidden) {
                        this.nodeIdsToHide.push(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id);
                    }
                }
            }
        }
        // check for any relationships to be hidden and update this.relationshipsToHide
        this.checkRelationshipsToHide();

        // create substitution node with this group's id and name
        /*public properties: any,
                public id: string,
                public type: string,
                public name: string,
                public minInstances: number,
                public maxInstances: number,
                public visuals: Visuals,
                documentation?: any,
                any?: any,
                otherAttributes?: any,
                public x?: number,
                public y?: number,
                public capabilities?: any,
                public requirements?: any,
                public deploymentArtifacts?: any,
                public policies?: any,
                private _state?: DifferenceStates*/
        let groupSubstitutionNode: TNodeTemplate = new TNodeTemplate({}, group.id,
                                                                        group.type, group.name,
                                                                        1,
                                                                        1,
                                                                        new Visuals("#303030", '',"","groupSubstitution",""),
                                                                        {}, {}, {},
                                                                    Math.floor(nodeXValue / hiddenNodesCount), Math.floor(nodeYValue / hiddenNodesCount));
        this.substitutionNodes.push(groupSubstitutionNode);
        // iterate all relationshipTemplates and check, if target or source is part of the substituted group. If so,
        // add a substitution relationship to or from the substituted group.
        // but don't do, if it is a group internal relationship
        // TODO: check, if it is an inter-group-relatonship! Then show a substitution relationship!
        for(let relTempIndex=0; relTempIndex<this.unformattedTopologyTemplate.relationshipTemplates.length; relTempIndex++){
            nodesSearch:
            for(let hiddenNodeTypeIndex=0; hiddenNodeTypeIndex<this.nodeIdsToHide.length; hiddenNodeTypeIndex++){
                if(this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].sourceElement.ref === this.nodeIdsToHide[hiddenNodeTypeIndex]){
                    let targetNotHidden = true;
                    for(let i = 0; i < this.nodeIdsToHide.length; i++){
                        if (this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].targetElement.ref === this.nodeIdsToHide[i]) {
                            targetNotHidden = false;
                            break;
                        }
                    }
                    // if the target is hidden as well, don't substitute this relationship
                    if(targetNotHidden) {
                        let relTemplate = this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex];
                        this.substitutionRelationships.push(new TRelationshipTemplate({ref: groupSubstitutionNode.id},
                            relTemplate.targetElement,
                            relTemplate.name,
                            "substitution_" + relTemplate.id,
                            relTemplate.type));
                    }
                    break nodesSearch;
                }else if(this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].targetElement.ref === this.nodeIdsToHide[hiddenNodeTypeIndex]){

                    let sourceNotHidden = true;
                    for(let i = 0; i < this.nodeIdsToHide.length; i++){
                        if (this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].sourceElement.ref === this.nodeIdsToHide[i]) {
                            sourceNotHidden = false;
                            break;
                        }
                    }
                    // if the target is hidden as well, don't substitute this relationship
                    if(sourceNotHidden) {
                        let relTemplate = this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex];
                        this.substitutionRelationships.push(new TRelationshipTemplate(relTemplate.sourceElement,
                            {ref: groupSubstitutionNode.id},
                            relTemplate.name,
                            "substitution_" + relTemplate.id,
                            relTemplate.type));
                    }
                    break nodesSearch;
                }
            }
        }
        // hide groups nodes and their relationships
        this.ngRedux.dispatch(this.actions.hideNodesAndRelationships(this.nodeIdsToHide, this.relationshipIdsToHide));
        // show substitution nodes and relationships
        this.ngRedux.dispatch(this.actions.setGroupsSubstitutions(this.substitutionNodes, this.substitutionRelationships));
        console.log("substituted group with id " + substituteGroupId);
        console.log("substitution nodes:\n" + JSON.stringify(this.substitutionNodes));
        console.log("substitution relationships:\n" + JSON.stringify(this.substitutionRelationships));
    }

    /**
     * desubstitutes all nodes of a group by a new group node by
     * a) removing a substitution node representing the group
     * b) removing substitution relationships to or from the substitution node
     * c) showing all nodes of the group (showGroup() call)
     * d) showing all relationships that go to or from one of these nodes (showGroup() call)
     *
     * @param deSubstituteGroupId
     */
    deSubstituteGroupById(deSubstituteGroupId: string){

        let group: TGroupModel;

        // find this group by its ID
        for(let groupIndex=0; groupIndex<this.groups.length; groupIndex++){
            if(this.groups[groupIndex].id === deSubstituteGroupId){
                group = this.groups[groupIndex];
                break;
            }
        }
        if(group == undefined){
            this.alert.error("couldn't find group for de-substitution. Group ID: " + deSubstituteGroupId);
            return;
        }

        // Remove group substitution node
        for(let substitutionNodeId = 0; substitutionNodeId < this.substitutionNodes.length; substitutionNodeId++){
            if(this.substitutionNodes[substitutionNodeId].id === deSubstituteGroupId){
                // remove substitution node with the same ID as the group from the list of substitution nodes
                this.substitutionNodes.splice(substitutionNodeId, 1);
                // done, there was only one substitution node
                break;
            }
        }

        // remove all relationships to/from the group node
        // iterate all substitution relationshipTemplates and check, if the group substitution node is set as target or source
        // if it is, remove this relationship
        for(let relTempIndex=0; relTempIndex<this.substitutionRelationships.length; relTempIndex++){
            if((this.substitutionRelationships[relTempIndex].sourceElement.ref === deSubstituteGroupId)
                    || (this.substitutionRelationships[relTempIndex].targetElement.ref === deSubstituteGroupId)){
                this.substitutionRelationships.splice(relTempIndex, 1);
                // make sure to check the same index the next time, since now this one got deleted
                relTempIndex--;
            }
        }
        // update global lists of substitution node templates and substitution relationship templates
        this.ngRedux.dispatch(this.actions.setGroupsSubstitutions(this.substitutionNodes, this.substitutionRelationships));
        // update global list of substitution nodes and their relationships
        this.ngRedux.dispatch(this.actions.hideNodesAndRelationships(this.nodeIdsToHide, this.relationshipIdsToHide));

        // show group nodes and relationships
        this.showGroup(group);

        console.log("substitution nodes:\n" + JSON.stringify(this.substitutionNodes));
        console.log("substitution relationships:\n" + JSON.stringify(this.substitutionRelationships));
        //console.log("substitution relationships:\n" + JSON.stringify(this.substitutionRelationships));
    }

    /**
     * hides or un-hides all nodes which are oft the given node type or children of it, according to the activated buttons
     */
    clickHideUnhideNodes(){
        //this.alert.info(typeof this.unformattedTopologyTemplate.nodeTemplates);
        var additionalNodeIdsToHide: string[] = [];
        // iterate over all node components
        for( var nodeIndex=0; nodeIndex<this.unformattedTopologyTemplate.nodeTemplates.length; nodeIndex++ ){
            if(this.viewbarButtonsState.buttonsState.hideHardwareButton){
                if(this.checkIfNodeTypeDerivedOf(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].type, '{http://www.example.org/tosca/nodetypes}Hardware-Node_0.0.1-w1-wip1')){
                    // add this node to the list of nodes to be set invisible
                    additionalNodeIdsToHide.push(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id);
                }
            }
            if(this.viewbarButtonsState.buttonsState.hideSoftwareButton){
                if(!this.checkIfNodeTypeDerivedOf(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].type, '{http://www.example.org/tosca/nodetypes}Hardware-Node_0.0.1-w1-wip1')){
                    // add this node to the list of nodes to be set invisible
                    additionalNodeIdsToHide.push(this.unformattedTopologyTemplate.nodeTemplates[nodeIndex].id);
                }
            }
        }
        this.nodeIdsToHide.forEach(nodeId => {
            for(let newNodeIdIndex = 0; newNodeIdIndex < additionalNodeIdsToHide.length; newNodeIdIndex++){
                if(additionalNodeIdsToHide[newNodeIdIndex] === nodeId){
                    // node already hidden, quit this function
                    return;
                }
                // "else" if this node is not already hidden, add it to the array of nodes to be hidden
                this.nodeIdsToHide.push(nodeId);
            }
        });
        this.alert.info("Hiding " + additionalNodeIdsToHide.length + " Nodes");
        this.checkRelationshipsToHide();
        console.log("hiding nodes: " + JSON.stringify(additionalNodeIdsToHide));
        console.log("hiding relationships: " + JSON.stringify(this.relationshipIdsToHide));
        this.ngRedux.dispatch(this.actions.hideNodesAndRelationships(this.nodeIdsToHide, this.relationshipIdsToHide));
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
    checkRelationshipsToHide(): void{
        this.relationshipIdsToHide = [];
        // iterate all relationshipTemplates and check, if a target or source is to be hidden. If so, add the relationship to the hidden ones as well
        for(let relTempIndex=0; relTempIndex<this.unformattedTopologyTemplate.relationshipTemplates.length; relTempIndex++){
            checkThisRelationship:
            for(let hiddenNodeTypeIndex=0; hiddenNodeTypeIndex<this.nodeIdsToHide.length; hiddenNodeTypeIndex++){
                if((this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].sourceElement.ref === this.nodeIdsToHide[hiddenNodeTypeIndex])
                        || (this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].targetElement.ref === this.nodeIdsToHide[hiddenNodeTypeIndex])){
                    this.relationshipIdsToHide.push(this.unformattedTopologyTemplate.relationshipTemplates[relTempIndex].id);
                    break checkThisRelationship;
                }
            }
        }
    }


    updateGroups(groups: TGroupModel[]){
        this.groups = groups;
        // initialize button states for dropdown menus
        this.viewbarButtonsState.buttonsState.hideGroupButtonStates = {};
        this.viewbarButtonsState.buttonsState.substituteGroupButtonStates = {};
        for(let groupId = 0; groupId < groups.length; groupId++){
            this.viewbarButtonsState.buttonsState.hideGroupButtonStates[groups[groupId].id] = false;
            this.viewbarButtonsState.buttonsState.substituteGroupButtonStates[groups[groupId].id] = false;
        }
        // initialization done, update globally
        this.setButtonsState(this.viewbarButtonsState);
        console.log("groups set");
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


enum VisualModificationMode {
    HIDENODES,
    SUBSTITUTENODES,
    NONE
}
