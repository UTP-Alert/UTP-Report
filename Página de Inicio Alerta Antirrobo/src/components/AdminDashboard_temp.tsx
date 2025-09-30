          {/* Reportes Cancelados Tab */}
          <TabsContent value="cancelados">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl flex items-center gap-3">
                  <X className="h-8 w-8 text-primary" />
                  Reportes Cancelados ({cancelledReports.length})
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar
                  </Button>
                  <Badge variant="outline" className="px-3 py-1">
                    ❌ CANCELADOS
                  </Badge>
                </div>
              </div>

              {cancelledReports.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <X className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No hay reportes cancelados</h3>
                    <p className="text-gray-500 mb-6">
                      No se han cancelado reportes recientemente.
                    </p>
                    <Badge variant="outline" className="px-4 py-2">
                      ℹ️ Estado: Sin cancelaciones
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cancelledReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="border-l-4 border-l-red-500 bg-red-50 hover:shadow-lg transition-all opacity-75"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl opacity-50">
                              {getIncidentTypeIcon(report.incidentType)}
                            </div>
                            <div>
                              <h4 className="text-lg text-gray-600">{getIncidentTypeLabel(report.incidentType)}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{report.zone}</span>
                                <span>•</span>
                                <span>Cancelado: {formatTimestamp(report.updatedAt)}</span>
                                <span>•</span>
                                <span>ID: #{report.id.slice(-6)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-gray-400 hover:bg-gray-500">
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-red-500 hover:bg-red-600">
                              CANCELADO
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-through">
                          {report.description}
                        </p>
                        
                        <div className="bg-gray-100 p-4 rounded-lg border mb-4">
                          <h5 className="font-medium mb-3 flex items-center gap-2 text-gray-600">
                            <X className="h-4 w-4" />
                            Información de Cancelación
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm text-gray-600">Fecha de cancelación</label>
                              <p className="text-sm font-medium">
                                {formatTimestamp(report.updatedAt)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Reporte original</label>
                              <p className="text-sm font-medium">
                                {formatTimestamp(report.timestamp)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Estado anterior</label>
                              <p className="text-sm font-medium">
                                En proceso
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {report.hasPhoto && (
                              <div className="flex items-center gap-1">
                                <Camera className="h-4 w-4" />
                                <span className="line-through">Evidencia: {report.photoName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span>{report.isAnonymous ? 'Reporte Anónimo' : 'Con contacto'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <X className="h-4 w-4" />
                              <span>Cancelado por administrador</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" disabled>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Archivado
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>