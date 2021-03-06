/*******************************************************************************
 * Copyright (c) 2017 Contributors to the Eclipse Foundation
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
 *******************************************************************************/
package org.eclipse.winery.repository.backend;

import org.eclipse.winery.common.ids.definitions.*;
import org.eclipse.winery.common.interfaces.IWineryRepositoryCommon;
import org.eclipse.winery.model.tosca.*;

/**
 * Offers getType for each subclass {@link org.eclipse.winery.model.tosca.HasType}
 */
public class GetType {

    public static TArtifactType getType(IWineryRepositoryCommon repository, TArtifactTemplate template) {
        return repository.getElement(new ArtifactTypeId(template.getTypeAsQName()));
    }

    public static TCapabilityType getType(IWineryRepositoryCommon repository, TCapability template) {
        return repository.getElement(new CapabilityTypeId(template.getTypeAsQName()));
    }

    public static TNodeType getType(IWineryRepositoryCommon repository, TNodeTemplate template) {
        return repository.getElement(new NodeTypeId(template.getTypeAsQName()));
    }

    public static TNodeType getType(IWineryRepositoryCommon repository, TNodeTypeImplementation template) {
        return repository.getElement(new NodeTypeId(template.getTypeAsQName()));
    }

    public static TPolicyType getType(IWineryRepositoryCommon repository, TPolicyTemplate template) {
        return repository.getElement(new PolicyTypeId(template.getTypeAsQName()));
    }

    public static TRelationshipType getType(IWineryRepositoryCommon repository, TRelationshipTemplate template) {
        return repository.getElement(new RelationshipTypeId(template.getTypeAsQName()));
    }

    public static TRelationshipType getType(IWineryRepositoryCommon repository, TRelationshipTypeImplementation template) {
        return repository.getElement(new RelationshipTypeId(template.getTypeAsQName()));
    }

    public static TRequirementType getType(IWineryRepositoryCommon repository, TRequirement template) {
        return repository.getElement(new RequirementTypeId(template.getTypeAsQName()));
    }

    public static TEntityType getType(IWineryRepositoryCommon repository, TEntityTemplate template) {
        if (template instanceof TArtifactTemplate) {
            return getType(repository, (TArtifactTemplate) template);
        } else if (template instanceof TCapability) {
            return getType(repository, (TCapability) template);
        } else if (template instanceof TNodeTemplate) {
            return getType(repository, (TNodeTemplate) template);
        } else if (template instanceof TPolicyTemplate) {
            return getType(repository, (TPolicyTemplate) template);
        } else if (template instanceof TRelationshipTemplate) {
            return getType(repository, (TRelationshipTemplate) template);
        }

        return null;
    }
}
