import http.server, ssl

server_address = ('localhost', 4443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='localhost.pem')
httpd.socket =context.wrap_socket(httpd.socket, server_side=True)
# httpd.socket = ssl.wrap_socket(httpd.socket,
#                                server_side=True,
#                                certfile='localhost.pem',
#                                ssl_version=ssl.PROTOCOL_TLS)
httpd.serve_forever()
