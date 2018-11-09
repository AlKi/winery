/*******************************************************************************
 * Copyright (c) 2013-2017 Contributors to the Eclipse Foundation
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

package org.eclipse.winery.model.tosca;

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.jdt.annotation.Nullable;

import javax.xml.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Class to represent Node Template Groups
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "tGroups", propOrder = {
    "groups"
})
public class TGroups {

    @XmlElement(name = "Groups", required = true)
    protected List<TGroup> groups;
    @XmlAttribute(name = "targetNamespace")
    @XmlSchemaType(name = "anyURI")
    protected String targetNamespace;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TGroups)) return false;
        TGroups tPlans = (TGroups) o;
        return Objects.equals(groups, tPlans.groups) &&
            Objects.equals(targetNamespace, tPlans.targetNamespace);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groups, targetNamespace);
    }

    @NonNull
    public List<TGroup> getGroups() {
        if (groups == null) {
            groups = new ArrayList<TGroup>();
        }
        return this.groups;
    }
    
    @Nullable
    public String getTargetNamespace() {
        return targetNamespace;
    }

    public void setTargetNamespace(String value) {
        this.targetNamespace = value;
    }
}
