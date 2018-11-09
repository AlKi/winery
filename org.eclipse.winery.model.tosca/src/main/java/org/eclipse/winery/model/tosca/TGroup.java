/*******************************************************************************
 * Copyright (c) 2013-2018 Contributors to the Eclipse Foundation
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

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.winery.model.tosca.visitor.Visitor;

import javax.xml.bind.annotation.*;
import javax.xml.bind.annotation.adapters.CollapsedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import javax.xml.namespace.QName;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "tGroup", propOrder = {
    "nodeTemplateIds"
})
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonTypeInfo(
    defaultImpl = TGroup.class,
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "fakeJacksonType")
public class TGroup extends TEntityTemplate {
    
    
    // id and type are handled by superclasses (TEntityTemplate and HasId)
    
    @XmlAttribute(name = "name", required = true)
    protected String name;

    @NonNull
    @XmlElementWrapper(name = "NodeTemplateIds")
    @XmlElement(name = "NodeTemplateIds")
    protected List<String> nodeTemplateIds;


    
    public TGroup() {

    }

    public TGroup(Builder builder) {
        super(builder);
        this.name = builder.name;
        this.type = builder.groupType;
        this.nodeTemplateIds = builder.nodeTemplateIds;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TGroup)) return false;
        if (!super.equals(o)) return false;
        TGroup tPlan = (TGroup) o;
        return Objects.equals(super.getId(), tPlan.getId()) &&
            Objects.equals(name, tPlan.name) &&
            Objects.equals(type, tPlan.type);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), super.getId(), name, type);
    }
    

    @Nullable
    public String getName() {
        return name;
    }

    public void setName(@NonNull String value) {
        this.name = value;
    }
    
    public TEntityTemplate.Properties getProperties() {
        return properties;
    }

    public void setProperties(TEntityTemplate.Properties properties) {
        this.properties = properties;
        this.getProperties().getKVProperties();
    }

    public List<String> getNodeTemplateIds() {
        return nodeTemplateIds;
    }

    public void setNodeTemplateIds(List<String> nodeTemplateIds) {
        this.nodeTemplateIds = nodeTemplateIds;
    }
    
    public void accept(Visitor visitor) {
        visitor.visit(this);
   }

    public static class Builder extends TEntityTemplate.Builder<Builder> {
        private String name;
        private QName groupType;
        private List<String> nodeTemplateIds;

        public Builder setName(String name) {
            this.name = name;
            return this;
        }
        
        public Builder(String id, QName type) {
            super(id, type);
        }


        public Builder setNodeTemplateIds(List<String> nodeTemplateIds){
            this.nodeTemplateIds = nodeTemplateIds;
            return this;
        }



        @NonNull
        public List<String> getNodeTemplateIds() {
            if (nodeTemplateIds == null) {
                nodeTemplateIds = new ArrayList<String>();
            }
            return this.nodeTemplateIds;
        }

        @Override
        public Builder self() {
            return this;
        }

        public TGroup build() {
            return new TGroup(this);
        }
    }
}
