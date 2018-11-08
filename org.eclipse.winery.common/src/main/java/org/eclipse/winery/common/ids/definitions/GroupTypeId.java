package org.eclipse.winery.common.ids.definitions;

import org.eclipse.winery.common.ids.Namespace;
import org.eclipse.winery.common.ids.XmlId;

import javax.xml.namespace.QName;

public class GroupTypeId extends EntityTypeId {

    public GroupTypeId(Namespace namespace, XmlId xmlId) {
        super(namespace, xmlId);
    }

    public GroupTypeId(String ns, String id, boolean URLencoded) {
        super(ns, id, URLencoded);
    }

    public GroupTypeId(QName qname) {
        super(qname);
    }

    @Override
    public String getGroup() {
        return "GroupType";
    }
}
